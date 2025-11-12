import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { wishlistService } from '@/services/api/wishlistService';
import { productService } from '@/services/api/productService';
import { cartService } from '@/services/api/cartService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import { cn } from '@/utils/cn';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(new Set());
  const [moving, setMoving] = useState(new Set());

  // Handle moving item from wishlist to cart
  const handleMoveToCart = async (product) => {
    if (product.stock === 0) {
      toast.error('This item is out of stock');
      return;
    }

    setMoving(prev => new Set([...prev, product.Id]));

    try {
      // First, add to cart
      await cartService.addItem(product, 1);
      
      // Then remove from wishlist
await wishlistService.remove(product.Id);
      
      // Update local state by removing the item
      setWishlistItems(prev => prev.filter(item => item.productId !== product.Id));
      setProducts(prev => prev.filter(p => p.Id !== product.Id));
      
      toast.success(`${product.name} moved to cart successfully!`);
    } catch (error) {
      console.error('Error moving item to cart:', error);
      
      // Provide specific error feedback
      if (error.message?.includes('cart')) {
        toast.error('Failed to add item to cart. Please try again.');
      } else if (error.message?.includes('wishlist')) {
        toast.error('Item was added to cart but could not be removed from wishlist.');
      } else {
        toast.error('Failed to move item to cart. Please try again.');
      }
    } finally {
      setMoving(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.Id);
        return newSet;
      });
    }
  };
  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      
      // Get wishlist items
      const wishlistData = await wishlistService.getAll();
      setWishlistItems(wishlistData);

      // Get all products to match with wishlist items
      const allProducts = await productService.getAll();
      
      // Filter products that are in wishlist
      const wishlistProducts = allProducts.filter(product =>
        wishlistData.some(item => item.productId === product.Id)
      );
      
      setProducts(wishlistProducts);
    } catch (error) {
      console.error('Error fetching wishlist data:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (removing.has(productId)) return;

    setRemoving(prev => new Set([...prev, productId]));

    try {
      const result = await wishlistService.remove(productId);
      
      if (result.success) {
        // Update local state
        setProducts(prev => prev.filter(product => product.Id !== productId));
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
        
        toast.success(result.message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemoving(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ApperIcon name="Heart" className="w-8 h-8 text-accent" />
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-primary">
              My Wishlist
            </h1>
          </div>
          
          {products.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your entire wishlist?')) {
                    wishlistService.clear().then(() => {
                      setProducts([]);
                      setWishlistItems([]);
                      toast.success('Wishlist cleared successfully');
                    });
                  }
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-200"
              >
                <ApperIcon name="Trash2" size={16} />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {products.length === 0 ? (
          <Empty
            icon="Heart"
            title="Your wishlist is empty"
            description="Save items you love to your wishlist and shop them later"
            actionLabel="Start Shopping"
            actionLink="/"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const isRemoving = removing.has(product.Id);
              const isLowStock = product.stock < 10;
              const isOutOfStock = product.stock === 0;
              
              // Calculate discount percentage
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountPercentage = hasDiscount 
                ? Math.round(((product.originalPrice - product.price) / product.price) * 100)
                : 0;

              return (
                <Card 
                  key={product.Id}
                  hover 
                  className={cn(
                    "group overflow-hidden transition-all duration-300",
                    isRemoving && "opacity-50"
                  )}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge variant="primary" className="text-xs font-bold shadow-lg">
                          {discountPercentage}% OFF
                        </Badge>
                      </div>
                    )}
                    
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.Id)}
                      disabled={isRemoving}
                      className={cn(
                        "absolute top-2 right-2 z-10 p-2 rounded-full",
                        "bg-white/90 backdrop-blur-sm shadow-soft",
                        "hover:bg-white hover:shadow-elevated",
                        "transition-all duration-200 ease-out",
                        "hover:scale-110 active:scale-95",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "group"
                      )}
                      aria-label="Remove from wishlist"
                    >
                      <ApperIcon 
                        name={isRemoving ? "Loader2" : "X"} 
                        size={18} 
                        className={cn(
                          "text-red-500 transition-colors duration-200",
                          isRemoving && "animate-spin"
                        )}
                      />
                    </button>

                    <Link to={`/product/${product.Id}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>
                    
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="error" size="lg">Out of Stock</Badge>
                      </div>
                    )}
                    
                    {isLowStock && !isOutOfStock && (
                      <Badge variant="warning" size="sm" className="absolute top-3 left-3">
                        Only {product.stock} left
                      </Badge>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <Link to={`/product/${product.Id}`}>
                        <h3 className="font-display font-semibold text-primary line-clamp-2 group-hover:text-accent transition-colors duration-200">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-primary font-display">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{product.rating}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{product.reviews} reviews</span>
                        </div>
                      </div>
                      
<Link to={`/product/${product.Id}`}>
                        <Button
                          size="sm"
                          className="shadow-elevated"
                        >
                          <ApperIcon name="Eye" size={16} />
                        </Button>
                      </Link>
                      
                      {/* Move to Cart Button */}
                      <Button
                        size="sm"
                        onClick={() => handleMoveToCart(product)}
                        disabled={isOutOfStock || moving.has(product.Id)}
                        className={cn(
                          "shadow-elevated transition-all duration-200",
                          isOutOfStock 
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                            : "bg-accent text-white hover:bg-accent/90",
                          moving.has(product.Id) && "opacity-50"
                        )}
                      >
                        <ApperIcon 
                          name={moving.has(product.Id) ? "Loader2" : "ShoppingCart"} 
                          size={16} 
                          className={moving.has(product.Id) ? "animate-spin" : ""}
                        />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;