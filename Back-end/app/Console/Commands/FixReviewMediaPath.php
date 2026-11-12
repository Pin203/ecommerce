<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixReviewMediaPath extends Command
{
    /**
     * Tên command (gọi trong terminal).
     *
     * @var string
     */
    protected $signature = 'fix:review-media-path';

    /**
     * Mô tả command.
     *
     * @var string
     */
    protected $description = 'Sửa lại media_url trong bảng review_medias (xóa prefix public/)';

    /**
     * Thực thi command.
     */
    public function handle()
    {
        $count = DB::table('review_medias')
            ->where('media_url', 'like', 'public/%')
            ->update([
                'media_url' => DB::raw("REPLACE(media_url, 'public/', '')")
            ]);

        $this->info("✅ Đã sửa {$count} dòng media_url trong bảng review_medias.");
    }
}
