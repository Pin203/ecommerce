<?php
namespace App\Mail;

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
        $this->otp = $otp;
        $this->username = $username;
    }

    public function build()
    {
        return $this->subject('Mã OTP đăng ký')
                    ->view('emails.register_otp')
                    ->with(['otp' => $this->otp, 'username' => $this->username]);
    }
}
