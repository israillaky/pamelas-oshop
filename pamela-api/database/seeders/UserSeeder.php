<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'name' => 'Israil',
                'username' => 'ipcastino',
                'email' => 'ipcastino@gmail.com',
                'password' => 'qwerty!2018',        // plain for now, will hash below
                'role' => 'super_admin',
            ],
            /*[
                'name' => 'Admin',
                'username' => 'admin',
                'email' => 'admin@pamelainventory.test',
                'password' => 'admin123',
                'role' => 'admin',
            ],
            [
                'name' => 'Staff',
                'username' => 'staff',
                'email' => 'staff@pamelainventory.test',
                'password' => 'password',
                'role' => 'staff',
            ],
            [
                'name' => 'Warehouse Manager',
                'username' => 'warehouse',
                'email' => 'warehouse@pamelainventory.test',
                'password' => 'password',
                'role' => 'warehouse_manager',
            ],
            [
                'name' => 'Warehouse Staff',
                'username' => 'warehouse_staff',
                'email' => 'warehousestaff@pamelainventory.test',
                'password' => 'password',
                'role' => 'warehouse_staff',
            ],
            [
                'name' => 'Cashier',
                'username' => 'cashier',
                'email' => 'cashier@pamelainventory.test',
                'password' => 'password',
                'role' => 'cashier',
            ],*/
        ];

        foreach ($defaults as $data) {
            $existing = User::where('username', $data['username'])->first();

            // Create new user
            if (! $existing) {
                User::create([
                    'name'     => $data['name'],
                    'username' => $data['username'],
                    'email'    => $data['email'],
                    'password' => Hash::make($data['password']),
                    'role'     => $data['role'],
                ]);
                continue;
            }

            // If user exists AND is super_admin → DO NOT MODIFY
            if ($existing->role === 'super_admin') {
                continue;
            }

            // Otherwise update the data (except password)
            $existing->update([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'role'     => $data['role'],
            ]);
        }
    }
}
