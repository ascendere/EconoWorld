import { PaginationBase } from './pagination-base';

export abstract class BaseResource extends PaginationBase {
  userId: string | null = null;

  protected toggleReaction(item: any, type: 'like' | 'dislike', updateFn: (item: any) => void): void {

    if (!this.userId) {
      alert('Debes iniciar sesión para reaccionar');
      return;
    }

    if (!item.likedBy) item.likedBy = [];
    if (!item.dislikedBy) item.dislikedBy = [];
    item.likes = item.likes || 0;
    item.dislikes = item.dislikes || 0;

    const likedBy = [...item.likedBy];
    const dislikedBy = [...item.dislikedBy];

    if (type === 'like') {
      if (likedBy.includes(this.userId)) {
        item.likedBy = likedBy.filter(id => id !== this.userId);
        item.likes--;
      } else {
        item.likedBy = [...likedBy, this.userId];
        item.likes++;
        if (dislikedBy.includes(this.userId)) {
          item.dislikedBy = dislikedBy.filter(id => id !== this.userId);
          item.dislikes--;
        }
      }
    } else {
      if (dislikedBy.includes(this.userId)) {
        item.dislikedBy = dislikedBy.filter(id => id !== this.userId);
        item.dislikes--;
      } else {
        item.dislikedBy = [...dislikedBy, this.userId];
        item.dislikes++;
        if (likedBy.includes(this.userId)) {
          item.likedBy = likedBy.filter(id => id !== this.userId);
          item.likes--;
        }
      }
    }

    console.log('Objeto actualizado localmente:', item);
    updateFn(item);
  }

  isLiked(item: any): boolean {
    return item.likedBy?.includes(this.userId);
  }

  isDisliked(item: any): boolean {
    return item.dislikedBy?.includes(this.userId);
  }
}
