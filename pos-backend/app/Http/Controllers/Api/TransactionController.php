<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\TransactionDetail;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TransactionStoreRequest;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');

            Log::info('Fetching transactions', [
                'page' => $page,
                'per_page' => $perPage,
                'search' => $search
            ]);

            $query = Transaction::with(['customer', 'details.product'])
                ->latest();

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery->where('name', 'like', "%{$search}%");
                        });
                });
            }

            $transactions = $query->paginate(
                $perPage,
                ['id', 'customer_id', 'total', 'discount', 'final_total', 'created_at', 'updated_at'],
                'page',
                $page
            );

            $response = [
                'success' => true,
                'message' => 'Transactions retrieved successfully',
                'data' => $transactions->items(),
                'pagination' => [
                    'total' => $transactions->total(),
                    'per_page' => $transactions->perPage(),
                    'current_page' => $transactions->currentPage(),
                    'last_page' => $transactions->lastPage(),
                    'from' => $transactions->firstItem() ?? 0,
                    'to' => $transactions->lastItem() ?? 0,
                    'has_more' => $transactions->hasMorePages(),
                ],
                'links' => [
                    'first' => $transactions->url(1),
                    'last' => $transactions->url($transactions->lastPage()),
                    'prev' => $transactions->previousPageUrl(),
                    'next' => $transactions->nextPageUrl(),
                ],
            ];

            return response()->json($response, 200);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TransactionStoreRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $validatedData = $request->validated();
                $items = $validatedData['items'];
                $customerId = $validatedData['customer_id'];


                // Hitung total dan validasi stock
                $total = 0;
                $validatedItems = [];

                foreach ($items as $item) {
                    $product = Product::findOrFail($item['product_id']);

                    // Check jika stok cukup
                    if ($product->stock < $item['qty']) {
                        Log::warning('Insufficient stock detected', [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'available_stock' => $product->stock,
                            'requested_qty' => $item['qty']
                        ]);

                        return response()->json([
                            'success' => false,
                            'message' => "Insufficient stock for product: {$product->name}",
                            'available_stock' => $product->stock,
                            'requested_qty' => $item['qty']
                        ], 422);
                    }

                    $item['price_at_time'] = $product->price;
                    $item['subtotal'] = $product->price * $item['qty'];
                    $total += $item['subtotal'];
                    $validatedItems[] = $item;
                }

                // Hitung diskon
                $discount = 0;
                if ($total > 1_000_000) {
                    $discount = $total * 0.15;
                } elseif ($total > 500_000) {
                    $discount = $total * 0.10;
                }

                $finalTotal = $total - $discount;

                $transaction = Transaction::create([
                    'customer_id' => $customerId,
                    'total' => $total,
                    'discount' => $discount,
                    'final_total' => $finalTotal,
                ]);

                foreach ($validatedItems as $item) {
                    // Simpan detail
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $item['product_id'],
                        'qty' => $item['qty'],
                        'price_at_time' => $item['price_at_time'],
                    ]);

                    // Kurangi stok
                    $product = Product::find($item['product_id']);
                    $product->decrement('stock', $item['qty']);

                    Log::info('Stock decreased for product', [
                        'transaction_id' => $transaction->id,
                        'product_id' => $item['product_id'],
                        'product_name' => $product->name,
                        'qty_sold' => $item['qty'],
                        'remaining_stock' => $product->stock
                    ]);
                }

                Log::info('Transaction completed successfully', [
                    'transaction_id' => $transaction->id,
                    'stock_updated' => true
                ]);

                $createdTransaction = Transaction::with('customer', 'details.product')
                    ->find($transaction->id);

                return response()->json([
                    'success' => true,
                    'message' => 'Transaction created successfully',
                    'data' => $createdTransaction
                ], 201);
            });

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation error creating transaction', [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error creating transaction', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        try {
            $transactionData = Transaction::with('customer', 'details.product')
                ->findOrFail($transaction->id);

            Log::info('Transaction retrieved', [
                'transaction_id' => $transaction->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction retrieved successfully',
                'data' => $transactionData
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('Transaction not found', [
                'transaction_id' => $transaction->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
                'error' => 'The requested transaction does not exist'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error retrieving transaction', [
                'transaction_id' => $transaction->id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
