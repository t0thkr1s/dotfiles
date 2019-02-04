"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Gulp = require("gulp");
const GulpStats = require("gulp-stats");
const tasks = require("./.gulp");
// Use gulp-stats
GulpStats(Gulp);
// set default task
Gulp.task('default', tasks.default);
//# sourceMappingURL=gulpfile.babel.js.map