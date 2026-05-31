import path from "node:path";
import { fileURLToPath } from "node:url";
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    watch: true,
    watchOptions: {
        ignored: /node_modules/,
        poll: 1000,
        aggregateTimeout: 500,
    },
    mode: "development",
    devtool: "eval-source-map",
    plugins: [
        new HtmlBundlerPlugin({
            entry: {
                index       : './src/index.html',
                config      : './src/config.html',
                help_data   : './src/help_data.html',
                help_display: './src/help_display.html',
                help_print  : './src/help_print.html',
                help_qrcode : './src/help_qrcode.html'
            },
            js: {
                // output filename of extracted JS from source script loaded in HTML via `<script>` tag
                filename: 'js/[name].js',
            },
            css: {
                // output filename of extracted CSS from source style loaded in HTML via `<link>` tag
                filename: 'css/[name].css',
            },
        }),
    ],
    module: {
        rules: [
            { test: /\.html$/i, loader: HtmlBundlerPlugin.loader },
            { test: /\.css$/i , use: ["css-loader"] },
            {
                test: /\.(ico|png|jpe?g|svg)$/i,
                type: 'asset',
                generator: {
                    // save images to file
                    filename: 'img/[name][ext]',
                },
                parser: {
                    dataUrlCondition: {
                        // inline images < 2 KB
                        maxSize: 2 * 1024,
                    }
                }
            }
        ]
    }
};