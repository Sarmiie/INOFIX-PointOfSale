<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\Api\ProductStoreRequest;
use App\Http\Requests\Api\ProductUpdateRequest;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);

        $query = Product::query();

        if ($search) {
            $query->where('name', 'LIKE', "%{$search}%")
                ->orWhere('code', 'LIKE', "%{$search}%");
        }

        $products = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'message' => 'Products retrieved successfully',
            'data' => $products->items(),
            'pagination' => [
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
                'has_more' => $products->hasMorePages(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductStoreRequest $request)
    {
        try {
            $data = $request->validated();

            // Handle image upload if present
            if ($request->hasFile('image')) {
                $image = $request->file('image');

                // Validate image file type and size if needed
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                $extension = strtolower($image->getClientOriginalExtension());

                if (!in_array($extension, $allowedExtensions)) {
                    return response()->json([
                        'message' => 'Invalid image format. Allowed formats: jpg, jpeg, png, gif, webp',
                        'errors' => ['image' => ['Invalid image format']]
                    ], 422);
                }

                $path = $image->store('products', 'public');
                $data['image_path'] = $path;
            }

            $product = Product::create($data);

            return response()->json([
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json([
            'message' => 'Product show',
            'data' => $product
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductUpdateRequest $request, Product $product)
    {
        try {
            $data = $request->validated();

            // Handle image upload if present
            if ($request->hasFile('image')) {
                $image = $request->file('image');

                // Validate image file type and size if needed
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                $extension = strtolower($image->getClientOriginalExtension());

                if (!in_array($extension, $allowedExtensions)) {
                    return response()->json([
                        'message' => 'Invalid image format. Allowed formats: jpg, jpeg, png, gif, webp',
                        'errors' => ['image' => ['Invalid image format']]
                    ], 422);
                }

                // Delete old image from storage (if exists)
                if ($product->image_path) {
                    Storage::disk('public')->delete($product->image_path);
                }

                // Store new image
                $data['image_path'] = $image->store('products', 'public');
            }

            // Update record in database
            $product->update($data);

            return response()->json([
                'message' => 'Product updated successfully',
                'data' => $product
            ], 200);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {

            return response()->json([
                'message' => 'This action is unauthorized',
                'error' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->delete();

            return response()->json([
                'message' => 'Customer deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
