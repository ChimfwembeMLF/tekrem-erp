<?php

namespace App\Http\Requests;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class OrganizationSignupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::default(), 'confirmed'],
            'organization_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'billing_plan_id' => [
                'required',
                'integer',
                Rule::exists('billing_plans', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->where('is_public', true)),
            ],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'terms' => ['accepted'],
        ];

        if (Setting::get('recaptcha.recaptcha_enabled', false) && Setting::get('recaptcha.recaptcha_on_register', true)) {
            $rules['recaptcha_token'] = ['required', 'string'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'terms.accepted' => 'You must accept the terms of service and privacy policy.',
        ];
    }

    public function withValidator($validator): void
    {
        if (! Setting::get('recaptcha.recaptcha_enabled', false) || ! Setting::get('recaptcha.recaptcha_on_register', true)) {
            return;
        }

        $validator->after(function ($validator) {
            if (! $this->validateRecaptcha($this->input('recaptcha_token', ''))) {
                $validator->errors()->add('recaptcha_token', 'reCAPTCHA verification failed.');
            }
        });
    }

    private function validateRecaptcha(string $token): bool
    {
        if ($token === '') {
            return false;
        }

        $secretKey = Setting::get('recaptcha.recaptcha_secret_key');
        if (! $secretKey) {
            return false;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $this->ip(),
            ]);

            $result = $response->json();

            if (! ($result['success'] ?? false)) {
                return false;
            }

            $version = Setting::get('recaptcha.recaptcha_version', 'v2');
            if ($version === 'v3') {
                $scoreThreshold = (float) Setting::get('recaptcha.recaptcha_score_threshold', 0.5);
                $score = $result['score'] ?? 0;

                return $score >= $scoreThreshold;
            }

            return true;
        } catch (\Exception) {
            return false;
        }
    }
}
