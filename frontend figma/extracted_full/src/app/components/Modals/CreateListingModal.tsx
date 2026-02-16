import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Upload, X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface CreateListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListingModal({ open, onOpenChange }: CreateListingModalProps) {
  const [listingType, setListingType] = useState<'offer' | 'request'>('offer');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    valuePoints: '',
    cashSweetener: '',
    tags: [] as string[],
  });
  const [currentTag, setCurrentTag] = useState('');

  const categories = [
    'Electronics',
    'Furniture',
    'Services',
    'Food',
    'Clothing',
    'Tools',
    'Books',
    'Sports',
    'Other',
  ];

  const handleAddTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag] });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.category || !formData.valuePoints) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Listing created successfully!');
    onOpenChange(false);
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      valuePoints: '',
      cashSweetener: '',
      tags: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            Share what you have to offer or what you're looking for
          </DialogDescription>
        </DialogHeader>

        <Tabs value={listingType} onValueChange={(v) => setListingType(v as 'offer' | 'request')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offer">I'm Offering</TabsTrigger>
            <TabsTrigger value="request">I'm Requesting</TabsTrigger>
          </TabsList>

          <TabsContent value={listingType} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder={
                  listingType === 'offer'
                    ? 'e.g., Vintage Camera - Perfect Condition'
                    : 'e.g., Need: Logo Design Services'
                }
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide details about your offering or request..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valuePoints">Value Points *</Label>
                <Input
                  id="valuePoints"
                  type="number"
                  placeholder="e.g., 450"
                  value={formData.valuePoints}
                  onChange={(e) => setFormData({ ...formData, valuePoints: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashSweetener">Cash Sweetener (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cashSweetener"
                  type="number"
                  placeholder="0"
                  className="pl-10"
                  value={formData.cashSweetener}
                  onChange={(e) => setFormData({ ...formData, cashSweetener: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Add a small cash amount to sweeten the deal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create {listingType === 'offer' ? 'Offer' : 'Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
