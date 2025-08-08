import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Package
} from 'lucide-react';

// Mock data for products
const mockProducts = [
  {
    id: '1',
    name: 'ICL Signature Hoodie',
    category: 'Hoodies',
    price: 2599,
    stock: 45,
    status: 'active',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Street Essential Tee',
    category: 'T-Shirts',
    price: 999,
    stock: 120,
    status: 'active',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-08',
  },
  {
    id: '3',
    name: 'Urban Cargo Pants',
    category: 'Pants',
    price: 3299,
    stock: 28,
    status: 'active',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    name: 'Vintage Wash Denim',
    category: 'Jeans',
    price: 4199,
    stock: 0,
    status: 'out-of-stock',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-03',
  },
  {
    id: '5',
    name: 'Minimalist Cap',
    category: 'Accessories',
    price: 799,
    stock: 85,
    status: 'active',
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-01',
  },
];

const categories = ['All Categories', 'Hoodies', 'T-Shirts', 'Pants', 'Jeans', 'Accessories'];

const statusColors = {
  active: 'bg-success/10 text-success border-success/20',
  'out-of-stock': 'bg-warning/10 text-warning border-warning/20',
  disabled: 'bg-muted/10 text-muted-foreground border-muted/20',
};

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products] = useState(mockProducts);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your streetwear product catalog
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter and search through your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-background/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Product Catalog</CardTitle>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              {filteredProducts.length} products
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-card rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {product.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/10 border-secondary/20 text-secondary-foreground">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{product.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={product.stock === 0 ? 'text-warning' : 'text-foreground'}>
                          {product.stock} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusColors[product.status as keyof typeof statusColors]}
                        >
                          {product.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                        <div className="text-muted-foreground">
                          No products found matching your criteria
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All Categories');
                        }}>
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;