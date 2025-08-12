import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { adminLookbookAPI } from '@/utils/api';

interface LookbookItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  products: string[];
  category: string;
  isActive: boolean;
  sortOrder: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const Lookbook: React.FC = () => {
  const [lookbookItems, setLookbookItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookbookItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    products: [],  // Start with empty array instead of [''] 
    category: 'Street Inspirations',
    isActive: true,
    sortOrder: 0,
    tags: [],     // Start with empty array instead of ['']
  });

  const categories = ['Street Inspirations', 'Urban Fits', 'Seasonal', 'Featured'];

  useEffect(() => {
    fetchLookbookItems();
  }, []);

  const fetchLookbookItems = async () => {
    try {
      setLoading(true);
      const response = await adminLookbookAPI.list({ limit: 100 });
      if (response.success) {
        setLookbookItems(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch lookbook items');
      console.error('Error fetching lookbook items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Add form validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.image.trim()) {
      toast.error('Image URL is required');
      return;
    }
    if (formData.products.length === 0 || formData.products.every(p => !p.trim())) {
      toast.error('At least one product is required');
      return;
    }

    try {
      const cleanFormData = {
        ...formData,
        products: formData.products.filter(p => p.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
      };

      console.log('Sending lookbook data:', cleanFormData);

      const response = await adminLookbookAPI.create(cleanFormData);
      if (response.success) {
        toast.success('Lookbook item created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchLookbookItems();
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error status:', error.status);
      console.error('Error payload:', error.payload);
      toast.error(`Failed to create lookbook item: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEdit = async () => {
    if (!editingItem) return;

    try {
      const cleanFormData = {
        ...formData,
        products: formData.products.filter(p => p.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
      };

      const response = await adminLookbookAPI.update(editingItem._id, cleanFormData);
      if (response.success) {
        toast.success('Lookbook item updated successfully');
        setIsEditDialogOpen(false);
        setEditingItem(null);
        resetForm();
        fetchLookbookItems();
      }
    } catch (error) {
      toast.error('Failed to update lookbook item');
      console.error('Error updating lookbook item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lookbook item?')) return;

    try {
      const response = await adminLookbookAPI.remove(id);
      if (response.success) {
        toast.success('Lookbook item deleted successfully');
        fetchLookbookItems();
      }
    } catch (error) {
      toast.error('Failed to delete lookbook item');
      console.error('Error deleting lookbook item:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await adminLookbookAPI.toggleStatus(id);
      if (response.success) {
        toast.success('Status updated successfully');
        fetchLookbookItems();
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      products: [],  // Reset to empty array
      category: 'Street Inspirations',
      isActive: true,
      sortOrder: 0,
      tags: [],     // Reset to empty array
    });
  };

  const openEditDialog = (item: LookbookItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      products: item.products.length > 0 ? item.products : [''],
      category: item.category,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      tags: item.tags.length > 0 ? item.tags : [''],
    });
    setIsEditDialogOpen(true);
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.length === 0 ? [''] : [...prev.products, ''],
    }));
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => i === index ? value : product),
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.length === 0 ? [''] : [...prev.tags, ''],
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag),
    }));
  };

  const filteredItems = lookbookItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lookbook Management</h1>
          <p className="text-muted-foreground">Manage your lookbook items and collections</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Testing API connection...');
              adminLookbookAPI.list({ limit: 1 }).then(res => {
                console.log('API test response:', res);
                toast.success('API connection working!');
              }).catch(err => {
                console.error('API test error:', err);
                toast.error(`API test failed: ${err.message}`);
              });
            }}
          >
            Test API
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lookbook Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Lookbook Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Enter image URL"
                  />
                </div>
                <div>
                  <Label>Products</Label>
                  {formData.products.length === 0 ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value=""
                        onChange={(e) => setFormData(prev => ({ ...prev, products: [e.target.value] }))}
                        placeholder="Enter product name"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(0)}
                        disabled
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    formData.products.map((product, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={product}
                          onChange={(e) => updateProduct(index, e.target.value)}
                          placeholder="Enter product name"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addProduct} className="mt-2">
                    Add Product
                  </Button>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags</Label>
                  {formData.tags.length === 0 ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value=""
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: [e.target.value] }))}
                        placeholder="Enter tag"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTag(0)}
                        disabled
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    formData.tags.map((tag, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="Enter tag"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTag(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addTag} className="mt-2">
                    Add Tag
                  </Button>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter sort order"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search lookbook items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lookbook Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(item._id)}
                  >
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Category:</span>
                  <Badge variant="outline" className="ml-2">{item.category}</Badge>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Products:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.products.map((product, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
                {item.tags.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lookbook Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <Label>Products</Label>
              {formData.products.map((product, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={product}
                    onChange={(e) => updateProduct(index, e.target.value)}
                    placeholder="Enter product name"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addProduct} className="mt-2">
                Add Product
              </Button>
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="Enter tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTag(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="mt-2">
                Add Tag
              </Button>
            </div>
            <div>
              <Label htmlFor="edit-sortOrder">Sort Order</Label>
              <Input
                id="edit-sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="Enter sort order"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lookbook;
