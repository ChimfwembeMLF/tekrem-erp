<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExternalTicketCreationTest extends TestCase
{
    /**
     * Test a user can create a ticket via API.
     */
    public function test_external_system_can_create_ticket()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $payload = [
            'title' => 'Test External Ticket',
            'description' => 'This was created from another system',
            'priority' => 'medium',
            'requester_name' => 'John External',
            'requester_email' => 'john@externalsystem.com',
            'source' => 'External System A',
            'external_reference_id' => 'EXT-54321',
        ];

        $response = $this->postJson('/api/tickets', $payload, [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'ticket' => [
                         'id',
                         'ticket_number',
                         'source',
                         'external_reference_id'
                     ]
                 ]);
                 
        $this->assertDatabaseHas('tickets', [
            'title' => 'Test External Ticket',
            'source' => 'External System A',
            'external_reference_id' => 'EXT-54321',
        ]);
    }
    
    public function test_unauthenticated_cannot_create_ticket()
    {
        $payload = [
            'title' => 'Test External Ticket',
            'description' => 'This was created from another system',
            'priority' => 'medium',
            'requester_name' => 'John External',
            'requester_email' => 'john@externalsystem.com',
            'source' => 'External System A',
        ];

        $response = $this->postJson('/api/tickets', $payload);

        $response->assertStatus(401);
    }
}
