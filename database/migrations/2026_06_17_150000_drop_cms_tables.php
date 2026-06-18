<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('media_page');
        Schema::dropIfExists('cms_page_revisions');
        Schema::dropIfExists('cms_menu_items');
        Schema::dropIfExists('cms_menus');
        Schema::dropIfExists('cms_redirects');
        Schema::dropIfExists('cms_media');
        Schema::dropIfExists('cms_media_folders');
        Schema::dropIfExists('cms_pages');
        Schema::dropIfExists('cms_templates');
    }

    public function down(): void
    {
        // CMS module removed — tables are not recreated.
    }
};
