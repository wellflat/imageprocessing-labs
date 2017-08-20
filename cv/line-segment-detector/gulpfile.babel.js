import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('default', () => {
    return gulp.src(['src/*.js', 'src/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('dst'));
});