<?php
namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Logitech G Pro X Superlight Mouse',
                'code' => 'LOG-MOUSE-001',
                'price' => 1250000,
                'stock' => 15,
                'image_path' => 'products/logitech-gpro-superlight.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Razer BlackWidow V3 Keyboard',
                'code' => 'RAZ-KB-002',
                'price' => 1850000,
                'stock' => 8,
                'image_path' => 'products/razer-blackwidow-v3.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SteelSeries Arctis Pro Headset',
                'code' => 'STS-HS-003',
                'price' => 2450000,
                'stock' => 12,
                'image_path' => 'products/steelseries-arctis-pro.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ASUS ROG Swift PG279Q 27" Monitor',
                'code' => 'ASU-MON-004',
                'price' => 8500000,
                'stock' => 5,
                'image_path' => 'products/asus-rog-swift-pg279q.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Corsair K70 RGB MK.2 Keyboard',
                'code' => 'COR-KB-005',
                'price' => 2100000,
                'stock' => 10,
                'image_path' => 'products/corsair-k70-rgb-mk2.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'HyperX Cloud II Headset',
                'code' => 'HPX-HS-006',
                'price' => 750000,
                'stock' => 20,
                'image_path' => 'products/hyperx-cloud-ii-wireless.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'MSI Optix MAG274QRF-QD 27" Monitor',
                'code' => 'MSI-MON-007',
                'price' => 7200000,
                'stock' => 7,
                'image_path' => 'products/msi-optix-mag274qrf.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Razer DeathAdder V3 Pro Mouse',
                'code' => 'RAZ-MOUSE-008',
                'price' => 1450000,
                'stock' => 18,
                'image_path' => 'products/razer-deathadder-v3-pro.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Logitech G915 TKL Keyboard',
                'code' => 'LOG-KB-009',
                'price' => 2850000,
                'stock' => 6,
                'image_path' => 'products/logitech-g915-tkl.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Alienware AW3423DW 34" Monitor',
                'code' => 'ALW-MON-010',
                'price' => 15500000,
                'stock' => 3,
                'image_path' => 'products/alienware-aw3423dw.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        Product::insert($products);

    }
}