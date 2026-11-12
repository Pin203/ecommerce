<?php

return [

    'mailgun'  => [
        'domain'   => env('MAILGUN_DOMAIN'),
        'secret'   => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme'   => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses'      => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'zalopay'  => [
        'app_id'       => env('ZALOPAY_APP_ID'),
        'key1'         => env('ZALOPAY_KEY1'),
        'key2'         => env('ZALOPAY_KEY2'),
        'endpoint'     => env('ZALOPAY_ENDPOINT', 'https://sb-openapi.zalopay.vn/v2/create'),
        'callback_url' => env('ZALOPAY_CALLBACK_URL', 'https://yourdomain.com/api/zalopay/callback'),
    ],

    'vnpay' => [
    'tmn_code' => env('VNPAY_TMN_CODE'),
    'hash_secret' => env('VNPAY_HASH_SECRET'),
    'url' => env('VNPAY_URL'),
    'return_url' => env('VNPAY_RETURN_URL'),
    ],




    'google'   => [
        'client_id'     => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect'      => env('GOOGLE_REDIRECT_URI'),
    ],

];
