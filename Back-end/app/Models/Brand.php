<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;
    protected $table = 'brand';
    protected $primaryKey = 'id_brand';
    public $timestamps = true;
    protected $fillable = ['name'];
    public function products() { return $this->hasMany(Product::class, 'id_brand'); }
}
