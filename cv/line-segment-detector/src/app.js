import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import LSDComponent from './lsd_component';
import GardenImage from './gardenterrace_gray.jpg';
import MidtownImage from './midtown_gray.jpg';
import BuildingImage from './building_gray.jpg';
import TokyoImage from './tokyostation_gray.jpg';

injectTapEventPlugin();

const style = {
    appBar: {
        margin: '10px 0 10px 0'
    },
    paper: {
        display: 'inline',
        margin: '15px'
    },
    radio: {
        fontSize: '1em',
    }
};

const App = props => (
    <MuiThemeProvider>
        <div>
            <AppBar title='Line Segment Detector Demo' style={style.appBar}
                showMenuIconButton={false} />
            <LSDComponent src={props.src} />
            <Paper style={style.paper}>
                <RadioButtonGroup name='inputImage' defaultSelected='image1'
                    onChange={e => changeImage(e)} style={style.radio}>
                    <RadioButton value='image1' label='Building' />
                    <RadioButton value='image2' label='Tokyo Midtown' />
                    <RadioButton value='image3' label='Tokyo Garden Terrace' />
                    <RadioButton value='image4' label='Tokyo Station' />
                </RadioButtonGroup>
            </Paper>
        </div>
    </MuiThemeProvider>
);
 
ReactDOM.render(
    <App src={BuildingImage} />,
    document.getElementById('content')
);

const changeImage = e => {
    const target = e.target.value;
    let image = null;
    switch (target) {
        case 'image1':
            image = BuildingImage;
            break;
        case 'image2':
            image = MidtownImage;
            break;
        case 'image3':
            image = GardenImage;
            break;
        case 'image4':
            image = TokyoImage;
            break;
    }
    
    ReactDOM.render(
        <App src={image} />,
        document.getElementById('content')
    );
}

/*
const image = new Image();
image.src = BuildingImage;
image.onload = () => {
    const width = image.width;
    const height = image.height;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    document.getElementById('content').appendChild(canvas);
    const imageData = context.getImageData(0, 0, width, height);
    let scale = 0.8;
    const detector = new LSD(0, scale);
    const lines = detector.detect(imageData);
    console.log('lines: ' + lines.length.toString());
    detector.drawSegments(context, lines);
};
*/
