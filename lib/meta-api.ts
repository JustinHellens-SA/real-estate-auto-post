import axios from 'axios';

const META_API_VERSION = 'v18.0';

interface MetaPostParams {
  pageId: string;
  accessToken: string;
  message: string;
  imageUrls: string[];
}

export async function postToFacebook({ pageId, accessToken, message, imageUrls }: MetaPostParams) {
  try {
    // Upload photos first
    const photoIds: string[] = [];
    
    for (const imageUrl of imageUrls.slice(0, 10)) {
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/${META_API_VERSION}/${pageId}/photos`,
        {
          url: imageUrl,
          published: false,
          access_token: accessToken,
        }
      );
      
      if (uploadResponse.data.id) {
        photoIds.push(uploadResponse.data.id);
      }
    }

    // Create post with photos
    const postResponse = await axios.post(
      `https://graph.facebook.com/${META_API_VERSION}/${pageId}/feed`,
      {
        message,
        attached_media: photoIds.map(id => ({ media_fbid: id })),
        access_token: accessToken,
      }
    );

    return {
      success: true,
      postId: postResponse.data.id,
      platform: 'facebook',
    };
  } catch (error: any) {
    console.error('Facebook posting error:', error.response?.data || error.message);
    throw new Error(`Facebook post failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

export async function postToInstagram({ 
  pageId, 
  accessToken, 
  message, 
  imageUrls 
}: MetaPostParams & { instagramAccountId?: string }) {
  try {
    // Get Instagram Business Account ID
    const accountResponse = await axios.get(
      `https://graph.facebook.com/${META_API_VERSION}/${pageId}`,
      {
        params: {
          fields: 'instagram_business_account',
          access_token: accessToken,
        },
      }
    );

    const instagramAccountId = accountResponse.data.instagram_business_account?.id;
    
    if (!instagramAccountId) {
      throw new Error('No Instagram Business Account linked to this Facebook Page');
    }

    // For single image post
    if (imageUrls.length === 1) {
      // Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/${META_API_VERSION}/${instagramAccountId}/media`,
        {
          image_url: imageUrls[0],
          caption: message,
          access_token: accessToken,
        }
      );

      // Publish media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/${META_API_VERSION}/${instagramAccountId}/media_publish`,
        {
          creation_id: containerResponse.data.id,
          access_token: accessToken,
        }
      );

      return {
        success: true,
        postId: publishResponse.data.id,
        platform: 'instagram',
      };
    } 
    // For carousel (multiple images)
    else if (imageUrls.length > 1) {
      // Create media containers for each image
      const containerIds: string[] = [];
      
      for (const imageUrl of imageUrls.slice(0, 10)) {
        const containerResponse = await axios.post(
          `https://graph.facebook.com/${META_API_VERSION}/${instagramAccountId}/media`,
          {
            image_url: imageUrl,
            is_carousel_item: true,
            access_token: accessToken,
          }
        );
        containerIds.push(containerResponse.data.id);
      }

      // Create carousel container
      const carouselResponse = await axios.post(
        `https://graph.facebook.com/${META_API_VERSION}/${instagramAccountId}/media`,
        {
          media_type: 'CAROUSEL',
          children: containerIds.join(','),
          caption: message,
          access_token: accessToken,
        }
      );

      // Publish carousel
      const publishResponse = await axios.post(
        `https://graph.facebook.com/${META_API_VERSION}/${instagramAccountId}/media_publish`,
        {
          creation_id: carouselResponse.data.id,
          access_token: accessToken,
        }
      );

      return {
        success: true,
        postId: publishResponse.data.id,
        platform: 'instagram',
      };
    }

    throw new Error('No images provided');
  } catch (error: any) {
    console.error('Instagram posting error:', error.response?.data || error.message);
    throw new Error(`Instagram post failed: ${error.response?.data?.error?.message || error.message}`);
  }
}
