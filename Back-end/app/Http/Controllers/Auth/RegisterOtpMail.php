<?php
namespace App\Http\Controllers\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegisterOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $username;

    public function __construct($otp, $username)
    {
        $this->otp      = $otp;
        $this->username = $username;
    }

    public function build()
    {
        return $this->subject('Mã OTP xác nhận đăng ký')
            ->view('emails.register_otp');
    }
}
