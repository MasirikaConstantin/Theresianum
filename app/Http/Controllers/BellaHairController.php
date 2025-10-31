<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Jmrashed\Zkteco\Lib\ZKTeco;

class BellaHairController extends Controller
{
    public function index()
    {
       try {
        $zk = new ZKTeco('10.244.185.184');
        $connected = $zk->connect();
        $attendanceLog = $zk->getAttendance();
  
        // Get today's date
        $todayDate = date('Y-m-d');
  
        // Filter attendance records for today
        $todayRecords = [];
        foreach ($attendanceLog as $record) {
            // Extract the date from the timestamp
            $recordDate = substr($record['timestamp'], 0, 10);
  
            // Check if the date matches today's date
            if ($recordDate === $todayDate) {
                $todayRecords[] = $record;
            }
        }
      return response()->json($todayRecords); 

       } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ]);
       }

      // Now $todayRecords contains attendance records for today
        
    }
}
