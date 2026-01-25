<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@example.com',
                'phone' => '081234567890',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Aminah',
                'email' => 'siti.aminah@gmail.com',
                'phone' => '082198765432',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Agus Firmansyah',
                'email' => 'agus.firmansyah@yahoo.com',
                'phone' => '085612345678',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.lestari@outlook.com',
                'phone' => '087789012345',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rudi Hartono',
                'email' => 'rudi.hartono@gmail.com',
                'phone' => '089876543210',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        Customer::insert($customers);

    }
}
