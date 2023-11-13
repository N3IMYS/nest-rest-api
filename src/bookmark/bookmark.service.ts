import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async getBookmarks(userId: number) {
    return await this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(
    userId: number,
    bookmarkId: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      throw new ForbiddenException('user id is invalid');

    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    return bookmark;
  }

  async ceateBookmark(
    userId: number,
    dto: CreateBookmarkDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      throw new ForbiddenException('user id is invalid');

    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    delete bookmark.created_at,
      delete bookmark.updated_at,
      delete bookmark.userId;

    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException(
        'Access to editing a bookmark denied',
      );
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(
    userId: number,
    bookmarkId: number,
  ) {}
}
