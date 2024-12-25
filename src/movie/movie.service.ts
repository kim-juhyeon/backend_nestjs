import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entitie/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly MovieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepositroy: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(title?: string) {
    const qb = await this.MovieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');
    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}` });
    }
    return qb.getManyAndCount();
    // if (!title) {
    //   return [
    //     await this.MovieRepository.find({
    //       relations: ['director'],
    //     }),
    //     await this.MovieRepository.count(),
    //   ];
    // }
    // return this.MovieRepository.find({
    //   where: {
    //     title: Like(`%${title}%`),
    //   },
    //   relations: ['director'],
    // });
  }

  async findone(id: number) {
    const movie = await this.MovieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.genres', 'detail')
      .where('movie.id = :id', { id })
      .getOne();
    // const movie = await this.MovieRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ['detail', 'director'],
    // });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }
    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const director = await qr.manager.findOne(Director, {
        where: {
          id: createMovieDto.directorId,
        },
      });
      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
      }
      const genres = await qr.manager.find(Genre, {
        where: {
          id: In(createMovieDto.genreIds),
        },
      });
      if (genres.length !== createMovieDto.genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르가 있습니다. -> ${genres.map((genre) => genre.id).join(',')}`,
        );
      }

      const movie = await this.MovieRepository.save({
        title: createMovieDto.title,
        detail: {
          detail: createMovieDto.detail,
        },
        director,
        genres,
      });
      await qr.commitTransaction();
      return movie;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
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
    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

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

    let newGenre;

    if (genreIds) {
      const geres = await this.genreRepository.find({
        where: {
          id: In(genreIds),
        },
      });
      if (geres.length !== updateMovieDto.genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르가 있습니다! 존재하는 ids -> ${geres.map((gere) => gere.id).join(',')}`,
        );
      }
      newGenre = geres;
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
    newMovie.genres = newGenre;
    await this.MovieRepository.save(newMovie);
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
