import React,{useEffect} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import TopologyDemo from "./pages/TopologyDemo";
import ReactGanttDemo from "./pages/ReactGanttDemo";
import { useStore } from './store'
import Preview from "./pages/TopologyDemo/Preview";

export let canvas: any;

function App() {
    const { commonStore, authStore } = useStore()
    useEffect(() => {
        console.log('commonStore.isLoadingTags==',commonStore.isLoadingTags)
    })
    return (
        <Router>
            <>
                {/*<nav>*/}
                {/*    <ul>*/}
                {/*        <li>*/}
                {/*            <Link to="/">Editor</Link>*/}
                {/*        </li>*/}
                {/*        <li>*/}
                {/*            <Link to="/editor">编辑器</Link>*/}
                {/*        </li>*/}
                {/*        <li>*/}
                {/*            <Link to="/gantt">甘特图</Link>*/}
                {/*        </li>*/}
                {/*    </ul>*/}
                {/*</nav>*/}
                {/*<Container maxWidth="lg">*/}
                {/*    <Box sx={{ my: 4 }}>*/}
                {/*        <Typography variant="h4" component="h1" gutterBottom>*/}
                {/*            Create React App example with TypeScript*/}
                {/*        </Typography>*/}
                {/*    </Box>*/}
                {/*    <ProTip/>*/}
                {/*    <Stack spacing={2} direction="row">*/}
                {/*        <Button variant="text">Text</Button>*/}
                {/*        <Button variant="contained">Contained</Button>*/}
                {/*        <Button variant="outlined">Outlined</Button>*/}
                {/*    </Stack>*/}
                {/*    <Card/>*/}
                {/*    <Box*/}
                {/*        component="form"*/}
                {/*        sx={{*/}
                {/*            '& > :not(style)': { m: 1, width: '25ch' },*/}
                {/*        }}*/}
                {/*        noValidate*/}
                {/*        autoComplete="off"*/}
                {/*    >*/}
                {/*        <TextField id="outlined-basic" label="X(px)" size="small" variant="outlined"/>*/}
                {/*        <TextField id="filled-basic" label="Filled" variant="filled" />*/}
                {/*        <TextField id="standard-basic" label="Standard" variant="standard" />*/}
                {/*    </Box>*/}
                {/*</Container>*/}
                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                <Switch>
                    <Route path="/editor" exact component={TopologyDemo}/>
                    <Route path="/gantt" exact component={ReactGanttDemo}/>
                    <Route path="/editor/preview" exact component={Preview}/>
                    <Route path="/" component={TopologyDemo}/>
                </Switch>
            </>
        </Router>
    )
}

export default App
