<?php

namespace App\Services;

use App\Models\Product;
use Picqer\Barcode\BarcodeGeneratorPNG;

class BarcodeService
{
    public static function generate(string $code)
    {
        $generator = new BarcodeGeneratorPNG();
        return base64_encode($generator->getBarcode($code, $generator::TYPE_CODE_128));
    }
    // Optional: move this here instead of controller
    public static function generateUniqueBarcode(): string
    {
        do {
            $barcode = (string) random_int(100000000000, 999999999999);
        } while (Product::where('barcode', $barcode)->exists());

        return $barcode;
    }
}
