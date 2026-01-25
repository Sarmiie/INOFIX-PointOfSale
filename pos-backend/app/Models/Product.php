<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    protected $fillable = [
        'name',
        'code',
        'price',
        'stock',
        'image_path'
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->image_path
                ? asset('storage/' . $this->image_path)
                : null
        );
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
