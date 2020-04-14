import React from 'react';
import socketIOClient from 'socket.io-client';
import {
    ENDPOINT_URL,
    NAMESPACE,
    highchart_options as options,
    gaugechart_options as gauge_options
} from "../../common/constants";
import Chart from "../../components/Chart";
import './dashboard.css'
import RunnerForm from '../../components/RunnerForm'
import Swal from 'sweetalert2'
//this is important to have because without this chart wont be available
import GaugeChart from "../../components/Gaugechart";
import * as ChartModuleMore from 'highcharts/highcharts-more.js';
import HCSoldGauge from 'highcharts/modules/solid-gauge';
import Highcharts from 'highcharts'

ChartModuleMore(Highcharts);
HCSoldGauge(Highcharts);
//this is important to have because without this chart wont be available

let socket;

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            points: '',
            distance: 0,
            goal_distance: 0,
            shouldClear:false
        }
    }

    connectionEstablised = (is_OK) => {
        console.log(is_OK);
        if (is_OK === 200)
            this.setState({ connected: true })
    }


    componentWillUnmount() {
        if (this.state.connected) {
            socket.emit('disconnect')
        }
    }

    update_graph = (points) => {
        console.log('Receiving points: ', points.new_distance)
        this.setState({ points: points, distance: points.new_distance })
    }

    showMessage = (motivational_message) => {
        Swal.fire({
            imageUrl: 'https://images.assetsdelivery.com/compings_v2/mspoint/mspoint1711/mspoint171100042.jpg',
            imageHeight: 300,
            imageWidth: 300,
            imageAlt: 'Goblet',
            title: 'Congratulations!',
            text: motivational_message.message
        })
        this.setState({shouldClear:true})
    }

    connect = () => {
        socket = socketIOClient(ENDPOINT_URL + NAMESPACE);

        socket.on('data_event', (points) => this.update_graph(points));
        socket.on('connection_success', (is_OK) => this.connectionEstablised(is_OK));
        socket.on('reach_goal', (motivational_message) => this.showMessage(motivational_message))
    }

    activateEvents = () => {
        if (this.state.connected) {
            this.setState({shouldClear:false})
            socket.emit('start_iot')
        }
    }

    setGoalDistance = (distance) => {
        this.setState({ goal_distance: distance })
    }

    render() {
        return (
            <div className={'container'}>
                <div className={'center-title'}>
                    <h1>Dashboard</h1>
                    <h5>{this.state.connected ? <p className={'success'}>CONNECTED</p> :
                        <p className={'fail'}>DISCONNECTED</p>}
                    </h5>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-sm">
                            <div style={{ marginTop: '200px', textAlign: 'center' }}>
                                <button className="btn btn-primary" onClick={this.connect}>
                                    Connect to Device
                                </button>
                            </div>
                            <div style={{ margin: '10px', textAlign: 'center' }}>
                                <button className="btn btn-primary" onClick={this.activateEvents}>
                                    Start running
                                </button>
                            </div>
                        </div >
                        <div className="col-sm">
                            <RunnerForm setDistance={(distnace) => this.setGoalDistance(distnace)} />
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-sm" style={{ float: 'left' }}>
                            <Chart
                                clear={this.state.shouldClear}
                                points={this.state.points}
                                options={options} />
                        </div>
                        <div className="col-sm" style={{ width: "300px" }}>
                            <GaugeChart
                                clear={this.state.shouldClear}
                                goal_distance={this.state.goal_distance}
                                distance={this.state.distance}
                                options={gauge_options} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Dashboard;