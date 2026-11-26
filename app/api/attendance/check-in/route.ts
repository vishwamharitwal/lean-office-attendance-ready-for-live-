export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Shift from "@/models/Shift";
import Setting from "@/models/Setting";
import { DEFAULT_SETTINGS, getDistanceFromOffice } from "@/lib/geolocation";
import { ApiResponse, CheckInRequestBody } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // 1. Auto-checkout dangling sessions from previous days (> 12 hours)
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const danglingRecord = await Attendance.findOne({
      userId: user.userId,
      checkOut: null,
      checkIn: { $lt: twelveHoursAgo },
    });

    if (danglingRecord) {
      const autoCheckOutTime = new Date(danglingRecord.checkIn.getTime() + 12 * 60 * 60 * 1000);
      danglingRecord.checkOut = autoCheckOutTime > now ? now : autoCheckOutTime;
      danglingRecord.workingMinutes = 12 * 60;
      danglingRecord.hoursWorked = 12;
      danglingRecord.notes = danglingRecord.notes
        ? `${danglingRecord.notes} | Auto-checkout after 12h`
        : "Auto-checkout after 12h";
      await danglingRecord.save();
    }

    // 2. Check if already checked in today (Strict: 1 check-in per day)
    const existingRecord = await Attendance.findOne({
      userId: user.userId,
      date: todayStr,
    });

    if (existingRecord) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "You have already checked in for today. Multiple check-ins per day are not allowed.",
          code: "ALREADY_CHECKED_IN",
        },
        { status: 400 }
      );
    }

    // 3. Get user with shift info
    let isLate = false;
    try {
      const userDoc = await User.findById(user.userId).populate("shift").exec();
      if (userDoc?.shift && typeof userDoc.shift === "object") {
        const shift = userDoc.shift as any;
        if (shift.startTime) {
          const [shiftHour, shiftMinute] = shift.startTime.split(":").map(Number);
          const checkInHour = now.getHours();
          const checkInMinute = now.getMinutes();

          const shiftStartMinutes = shiftHour * 60 + shiftMinute;
          const checkInMinutes = checkInHour * 60 + checkInMinute;
          const minutesLate = checkInMinutes - shiftStartMinutes;

          isLate = minutesLate > (shift.lateThresholdMinutes || 15);
        }
      }
    } catch (e) {
      console.error("Shift calculation fallback in check-in:", e);
    }

    // 4. Parse request body
    let body: CheckInRequestBody = {};
    try {
      body = await request.json();
    } catch { }

    // 5. Geolocation & Geofence evaluation
    const settingDoc = await Setting.findOne({ key: "location" });
    const locationConfig = settingDoc?.value || DEFAULT_SETTINGS;

    const hasCoords = typeof body.lat === "number" && typeof body.lng === "number";
    let outOfOffice = false;
    let distanceMeters: number | null = null;

    if (hasCoords) {
      distanceMeters = getDistanceFromOffice(
        body.lat!,
        body.lng!,
        locationConfig.officeLat,
        locationConfig.officeLng
      );
      outOfOffice = distanceMeters > (locationConfig.radiusMeters || 500);

      if (locationConfig.strictGeofence && outOfOffice) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: `You are ${Math.round(distanceMeters)}m away from office. Strict mode requires you to be within ${locationConfig.radiusMeters}m to check in.`,
            code: "GEOFENCE_RESTRICTION",
          },
          { status: 403 }
        );
      }
    } else if (locationConfig.strictGeofence) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "GPS Location is required for check-in in Strict Geofence mode. Please enable GPS on your device.",
          code: "LOCATION_REQUIRED",
        },
        { status: 400 }
      );
    }

    // 6. Create attendance record
    const attendance = await Attendance.create({
      userId: user.userId,
      date: todayStr,
      checkIn: now,
      status: isLate ? "late" : "present",
      notes: body.notes || "",
      location: hasCoords ? { lat: body.lat, lng: body.lng } : { lat: null, lng: null },
      outOfOffice,
    });

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: isLate ? "Check-in recorded (Late)" : "Check-in successful",
        data: {
          _id: attendance._id,
          date: attendance.date,
          checkIn: attendance.checkIn,
          status: attendance.status,
          outOfOffice,
          distanceMeters: distanceMeters !== null ? Math.round(distanceMeters) : null,
          isLate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Check-in error:", error);

    if (error instanceof Error && error.message.includes("Cast to ObjectId failed")) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Your profile has outdated data. Please update your profile or contact admin.",
          code: "LEGACY_DATA_ERROR",
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
