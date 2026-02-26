<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'column_id',
        'sprint_id',
        'epic_id',
        'task_id',
        'type',
        'title',
        'description',
        'assignee_id',
        'reporter_id',
        'priority',
        'story_points',
        'due_date',
        'status',
        'labels',
        'dependencies',
        'order',
    ];

    protected $casts = [
        'labels' => 'array',
        'dependencies' => 'array',
        'due_date' => 'date',
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function column()
    {
        return $this->belongsTo(BoardColumn::class, 'column_id');
    }

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }

    public function epic()
    {
        return $this->belongsTo(Epic::class);
    }

    /**
     * Get the project task associated with this board card.
     *
     * Defines a belongsTo relationship with ProjectTask via the 'task_id' foreign key.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function task()
    {
        return $this->belongsTo(ProjectTask::class, 'task_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function comments()
    {
        return $this->hasMany(CardComment::class, 'card_id');
    }

    public function attachments()
    {
        return $this->hasMany(CardAttachment::class, 'card_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(CardActivityLog::class, 'card_id');
    }

    public function labels()
    {
        return $this->belongsToMany(Label::class, 'card_label', 'card_id', 'label_id');
    }

    public function watchers()
    {
        return $this->belongsToMany(User::class, 'card_watchers', 'card_id', 'user_id');
    }

    public function checklists()
    {
        return $this->hasMany(CardChecklist::class, 'card_id');
    }

    public function relations()
    {
        return $this->hasMany(CardRelation::class, 'card_id');
    }

    public function votes()
    {
        return $this->hasMany(CardVote::class, 'card_id');
    }

    public function subscribers()
    {
        return $this->hasMany(CardSubscriber::class, 'card_id');
    }

    public function reminders()
    {
        return $this->hasMany(CardReminder::class, 'card_id');
    }

}
