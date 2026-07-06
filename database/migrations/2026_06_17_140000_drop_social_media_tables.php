<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_chats');
        Schema::dropIfExists('whatsapp_contacts');
        Schema::dropIfExists('whatsapp_accounts');
        Schema::dropIfExists('tweets');
        Schema::dropIfExists('twitter_accounts');
        Schema::dropIfExists('linked_in_leads');
        Schema::dropIfExists('linked_in_companies');
        Schema::dropIfExists('instagram_media');
        Schema::dropIfExists('instagram_accounts');
        Schema::dropIfExists('facebook_leads');
        Schema::dropIfExists('facebook_pages');
        Schema::dropIfExists('social_posts');
        Schema::dropIfExists('social_webhooks');

        if (Schema::hasTable('leads')) {
            Schema::table('leads', function (Blueprint $table) {
                if (Schema::hasColumn('leads', 'facebook_lead_id')) {
                    $table->dropUnique(['facebook_lead_id']);
                    $table->dropIndex(['facebook_lead_id']);
                }
                if (Schema::hasColumn('leads', 'facebook_campaign_id')) {
                    $table->dropIndex(['facebook_campaign_id']);
                }
            });

            Schema::table('leads', function (Blueprint $table) {
                $columns = [
                    'facebook_lead_id',
                    'facebook_ad_id',
                    'facebook_campaign_id',
                    'facebook_form_id',
                    'facebook_created_time',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('leads', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }

    public function down(): void
    {
        // Social media module removed — tables are not recreated.
    }
};
