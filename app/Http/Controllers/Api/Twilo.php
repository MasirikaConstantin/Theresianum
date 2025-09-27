<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Twilio\Rest\Client;

class Twilo extends Controller
{
    public function twilio(Request $request){
    $sid    = "ACf38e4a9dded562a425d9f7ed0cadc202";
    $token  = env('TWILIO_AUTH_TOKEN');
    $twilio = new Client($sid, $token);

    $message = $twilio->messages
      ->create("whatsapp:+243976075391", // to
        array(
          "from" => "whatsapp:+14155238886",
         
          "body" => "Your Message lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        )
      );

print($message->sid);}
}
