//import React from 'react';
//import ReactDOM from 'react-dom';
import LSD from './lsd';
import SampleImage from './garden_terrace_grey.jpg';

let detector = new LSD(1);

/*
class CanvasComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: new Image(),
            context: null,
            width: 0,
            height: 0
        };
    }
    
    loadImage(fileName) {
        this.state.image.src = fileName;
        this.state.image.onload = this.onLoad;
    },
    onLoad() {
        this.setState({});
    }
    
    render() {
        return (
            <canvas id="canvas" width={this.state.width} height={this.state.height}>
            </canvas>
        )
    }

}
*/
/*
ReactDOM.render(
    <CanvasComponent />,
    document.getElementById('content')
);
*/

let image = new Image();
image.src = SampleImage;
image.onload = () => {
    const width = image.width;
    const height = image.height;
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    document.getElementById('content').appendChild(canvas);
    let imageData = context.getImageData(0, 0, width, height);
    detector.detect(imageData);
};
