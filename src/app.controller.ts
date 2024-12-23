import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { title } from 'process';
import { NoFilesInterceptor } from '@nestjs/platform-express';

interface Movie {
  id: number;
  title: string;
}

@Controller('movie')
export class AppController {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '반지의제왕',
    },
  ];
  private idcounter = 3;

  constructor(private readonly appService: AppService) {}

  @Get()
  getMovies(@Query('title') title?: string) {
    if (!title) {
      return this.movies;
    }
    return this.movies.filter((m) => m.title.startsWith(title));
  }

  @Get(':id')
  getMovies1(@Param('id') id: string) {
    const movie = this.movies.find((m) => m.id == +id);
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영황입니다.');
    }
    return movie;
  }

  @Post()
  postMovie(@Body('title') title: string) {
    const movie: Movie = {
      id: this.idcounter++,
      title: title,
    };
    this.movies.push(movie);
    return movie;
  }

  @Patch(':id')
  pathMovie(@Param('id') id: string, @Body('title') title: string) {
    const movie = this.movies.find((m) => m.id == +id);
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    Object.assign(movie, { title });
    return movie;
  }

  @Delete(':id')
  deleteMovie(@Param('id') id: string) {
    const movieIndex = this.movies.findIndex((m) => m.id === +id);
    if (movieIndex === -1) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }
    this.movies.splice(movieIndex, 1);
    return id;
  }
}
