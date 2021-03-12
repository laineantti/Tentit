import { React } from 'react'
import {
    Card, CardContent, Container, Box, CssBaseline
} from '@material-ui/core'
import HorizontalBarChart from './HorizontalBarChart'
import DoughnutChart from './DoughnutChart'


function Stats() {

    return (
        <>
        <Box>
            <CssBaseline />
            <Container key="container1_user" style={{ marginTop: "80px", marginBottom: "15px" }} maxWidth="lg"
                component="main">
                <Card style={{ marginTop: "10px" }}>
                    <CardContent style={{ width: "100%" }} className="HorizontalBarChart">
                        <HorizontalBarChart />
                    </CardContent>
                </Card>
                <Card style={{ marginTop: "10px" }}>
                    <CardContent style={{ width: "100%" }} className="DoughnutChart">
                        <DoughnutChart />
                    </CardContent>
                </Card>
            </Container>
        </Box>
        </>
    )
}

export default Stats