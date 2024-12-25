import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entitie/director.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly MovieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepositroy: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  findAll(title?: string) {
    if (!title) {
      return this.MovieRepository.find();
    }
    return this.MovieRepository.find({
      where: {
        title: Like(`%${title}%`),
      },
    });
  }

  async findone(id: number) {
    const movie = await this.MovieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }
    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId,
      },
    });
    if (director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
    }

    const movie = await this.MovieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        detail: createMovieDto.detail,
      },
      director,
    });

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.MovieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }
    const { detail, directorId, ...movieRest } = updateMovieDto;

    let newDirector;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: {
          id: directorId,
        },
      });
      if (!director) {
        throw new NotFoundException('존재하지 않는 id의 감독입니다!.');
      }
      newDirector = director;
    }

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && { director: newDirector }),
    };

    await this.MovieRepository.update({ id }, movieUpdateFields);
    if (detail) {
      await this.movieDetailRepositroy.update(
        {
          id: movie.detail.id,
        },
        {
          detail,
        },
      );
    }
    const newMovie = await this.MovieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director'],
    });
    return newMovie;
  }
  async remove(id: number) {
    const movie = await this.MovieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }
    await this.MovieRepository.delete(id);
    await this.MovieRepository.delete(movie.detail.id);
    return id;
  }
}
