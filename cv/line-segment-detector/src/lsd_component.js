import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import LSD from './lsd';

export default class LSDComponent extends React.Component {
    constructor(props) {
        super(props);
        this.onLoad = this.onLoad.bind(this);
    }
    componentDidMount() {
        this.image = new Image();
        this.image.onload = this.onLoad;
        this.image.src = this.props.src;
        this.canvas = this.refs.canvas;
        this.width = 0;
        this.height = 0;
    }
    componentDidUpdate() {
        this.image.src = this.props.src;
    }
    apply(e) {
        e.preventDefault();
        const ctx = this.canvas.getContext('2d'),
            imageData = ctx.getImageData(0, 0, this.width, this.height),
            scale = 0.8,
            detector = new LSD(0, scale),
            lines = detector.detect(imageData);
        console.log('lines: ' + lines.length.toString());
        detector.drawSegments(ctx, lines);
    }
    reset(e) {
        e.preventDefault();
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
    }
    onLoad() {
        const ctx = this.canvas.getContext('2d');
        this.width = this.image.width;
        this.height = this.image.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
    }
    render() {
        return (
            <article>
                <div>
                    <canvas ref="canvas" />
                </div>
                <div>
                    <RaisedButton ref="button" label="detect line segments" primary={true}
                        onTouchTap={e => this.apply(e)} />
                    <RaisedButton ref="reset" label="reset canvas" primary={false}
                        onTouchTap={e => this.reset(e)} />
                </div>
            </article>
        )
    }
}