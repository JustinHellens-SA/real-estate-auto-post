'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Edit2, Upload, Send, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface PostData {
  id: string;
  address: string;
  price?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  description?: string;
  propertyImages: string[];
  selectedImages?: string[];
  captions: Array<{ caption: string; hashtags: string }>;
  selectedCaption?: string;
  coverImageUrl?: string;
  agentId?: string;
}

interface Agent {
  id: string;
  name: string;
  facebookToken?: string;
  instagramUserId?: string;
  tokenExpires?: string;
  defaultPostingMode?: string;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);
  const [customCaption, setCustomCaption] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [postingMode, setPostingMode] = useState<'company' | 'personal' | 'both'>('company');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`);
      const data = await response.json();
      
      if (data.propertyImages && typeof data.propertyImages === 'string') {
        data.propertyImages = JSON.parse(data.propertyImages);
      }
      if (data.captions && typeof data.captions === 'string') {
        data.captions = JSON.parse(data.captions);
      }
      
      setPost(data);
      setCustomCaption(data.selectedCaption || data.captions[0]?.caption || '');
      
      // Set cover image if auto-generated
      if (data.coverImageUrl) {
        setCoverImage(data.coverImageUrl);
      }
      
      // Initialize with all images selected by default
      setSelectedImages(data.selectedImages || data.propertyImages || []);
      
      // Fetch agent data if available
      if (data.agentId) {
        const agentResponse = await fetch(`/api/agents/${data.agentId}`);
        if (agentResponse.ok) {
          const agentData = await agentResponse.json();
          setAgent(agentData);
          
          // Set default posting mode based on agent preference
          if (agentData.defaultPostingMode) {
            setPostingMode(agentData.defaultPostingMode);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageToggle = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(img => img !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const isTokenExpired = (expiryDate?: string) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < new Date();
  };

  const handleCaptionSelect = (index: number) => {
    setSelectedCaptionIndex(index);
    if (post) {
      setCustomCaption(post.captions[index].caption + '\n\n' + post.captions[index].hashtags);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In production, upload to your server/storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!post) return;
    
    setPosting(true);
    try {
      const response = await fetch('/api/post-to-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          caption: customCaption,
          coverImage: coverImage,
          selectedImages: selectedImages,
          postingMode: postingMode,
          agentId: post.agentId,
        }),
      });

      if (response.ok) {
        alert('Posted successfully to Facebook & Instagram!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Post error:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Post not found</p>
          <a href="/" className="text-indigo-600 hover:underline mt-4 inline-block">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Review & Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {post.address}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Property Details */}
          <div className="space-y-6">
            {/* Property Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Property Details
              </h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Address:</strong> {post.address}</p>
                {post.price && <p><strong>Price:</strong> {post.price}</p>}
                {post.bedrooms && <p><strong>Bedrooms:</strong> {post.bedrooms}</p>}
                {post.bathrooms && <p><strong>Bathrooms:</strong> {post.bathrooms}</p>}
                {post.sqft && <p><strong>Size:</strong> {post.sqft} sqft</p>}
              </div>
            </div>

            {/* Property Images */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Select Photos to Include
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click images to select/deselect. Selected images will be posted to social media.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {post.propertyImages.map((img, idx) => {
                  const isSelected = selectedImages.includes(img);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleImageToggle(img)}
                      className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition ${
                        isSelected
                          ? 'ring-4 ring-indigo-600'
                          : 'ring-2 ring-gray-300 dark:ring-gray-600 opacity-50'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Property ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        Photo {idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {selectedImages.length} of {post.propertyImages.length} photos selected
              </p>
            </div>

            {/* Cover Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Cover Image
              </h2>
              
              {(coverImage || post.coverImageUrl) && (
                <div className="mb-4">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                    ✓ Cover image ready
                  </p>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 mb-3">
                    <img 
                      src={coverImage || post.coverImageUrl!} 
                      alt="Cover" 
                      className="object-cover w-full h-full" 
                    />
                  </div>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-500 mt-2">
                {post.coverImageUrl 
                  ? '✨ Auto-generated cover ready! Or upload custom Canva design' 
                  : 'Upload a Canva design or custom cover image'}
              </p>
            </div>
          </div>

          {/* Right Column - Captions & Actions */}
          <div className="space-y-6">
            {/* AI Generated Captions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Choose Caption
              </h2>
              <div className="space-y-3">
                {post.captions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCaptionSelect(idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedCaptionIndex === idx
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white mb-2">{item.caption}</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">{item.hashtags}</p>
                      </div>
                      {selectedCaptionIndex === idx && (
                        <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Caption Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                Edit Caption
              </h2>
              <textarea
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Customize your caption here..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {customCaption.length} characters
              </p>
            </div>

            {/* Posting Mode Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Where to Post
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${postingMode === 'company' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}">
                  <input
                    type="radio"
                    name="postingMode"
                    value="company"
                    checked={postingMode === 'company'}
                    onChange={(e) => setPostingMode(e.target.value as 'company')}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">Company Account</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Post to Local Real Estate SA's Facebook & Instagram</div>
                  </div>
                </label>

                {agent?.facebookToken && !isTokenExpired(agent.tokenExpires) ? (
                  <>
                    <label className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${postingMode === 'personal' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}">
                      <input
                        type="radio"
                        name="postingMode"
                        value="personal"
                        checked={postingMode === 'personal'}
                        onChange={(e) => setPostingMode(e.target.value as 'personal')}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">My Personal Account</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Post to {agent.name}'s Facebook & Instagram</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${postingMode === 'both' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}">
                      <input
                        type="radio"
                        name="postingMode"
                        value="both"
                        checked={postingMode === 'both'}
                        onChange={(e) => setPostingMode(e.target.value as 'both')}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">Both Accounts 🚀</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Post to company AND personal accounts (maximum reach)</div>
                      </div>
                    </label>
                  </>
                ) : (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ℹ️ Connect your Facebook account in <a href="/agents" className="text-indigo-600 hover:underline">Agent Settings</a> to post to your personal profile
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Post Button */}
            <button
              onClick={handlePost}
              disabled={posting || !customCaption || !coverImage || selectedImages.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {posting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Post to Facebook & Instagram
                </>
              )}
            </button>
            
            {!coverImage && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                ⚠️ Cover image required before posting
              </p>
            )}
            {selectedImages.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                ⚠️ Select at least one property photo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
