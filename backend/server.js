import express from 'express';
import fs from 'fs';
import path from "path";
import JSON5 from 'json5';
import hasCycle from './graphCheck.js';
import graphWalk from "./graphWalk.js";
import mysql from 'mysql2/promise';

// 获取 __filename 和 __dirname
const __dirname = process.env.CONFIG_DIR;

const app = express();
const port = process.env.PORT;

const sqlEngines = {};
const targetEnvJson = path.resolve(__dirname, 'config/targetEnv.json5');
const targetEnv = JSON5.parse(fs.readFileSync(targetEnvJson, 'utf8'));
for(const env of targetEnv) {
    for(const datasource of env.datasource || []) {
        const key = env.value+":"+datasource.value;
        const params = datasource.params;
        console.log(`初始化数据库${key}：${params.username}@${params.host}:${params.port}-${params.database}`);
        sqlEngines[key] = await mysql.createConnection({
            database: params.database,
            user: params.username,
            password: params.password,
            host: params.host,
            port: params.port,
        });
    }
}

app.use(express.json());

app.post('/api/json', async (req, res) => {
    try {
        const jsonEntity = path.resolve(__dirname, `config/${req.body.filename}`);
        const jsonObject = JSON5.parse(fs.readFileSync(jsonEntity, 'utf8'));
        res.json(jsonObject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const flowMetaJson = path.resolve(__dirname, 'config/flowMeta.json5');
let flowMeta = JSON5.parse(fs.readFileSync(flowMetaJson, 'utf8'));
if (hasCycle(flowMeta)) {
    throw "flowMeta.json5 加载异常：数据成环";
}
app.post('/api/renderFlow', async(req,res) => {
    try {
        const newContext = await graphWalk(
            sqlEngines,
            req.body.env,
            JSON5.parse(req.body.query),
            req.body.focus,
            flowMeta);
        res.json(newContext);
    } catch (error) {
        console.log(`server.js ${error.message}`)
        res.status(500).json({ message: error.message, name: error.name, stack: error.stack});
    }
});

app.post('/api/dumpFlow', async(req, res) => {
    try {
        fs.writeFileSync(flowMetaJson, JSON5.stringify(flowMeta, null, 2), 'utf8');
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.post('/api/deleteNode', async(req, res) => {
    try {
        flowMeta = flowMeta.filter(node => node.value.toLowerCase() !== req.body.nodeValue.toLowerCase());
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.post('/api/addOrUpdateNode', async(req, res) => {
    try {
        const newNode = JSON5.parse(req.body.node);
        flowMeta = flowMeta.filter(node => node.value.toLowerCase() !== newNode.value.toLowerCase());
        flowMeta.push(newNode);
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.post('/api/listNode', async (req, res) => {
    try {
        if (req.body.keyword == null || req.body.keyword === '') {
            res.json(flowMeta
                .map(node => ({
                    value: node.value,
                    label: node.label,
                }))
            );
        } else {
            res.json(flowMeta
                .filter(
                    node => node.value.toLowerCase().includes(req.body.keyword.toLowerCase())
                        || node.label.toLowerCase().includes(req.body.keyword.toLowerCase())
                ).map(node => ({
                    value: node.value,
                    label: node.label,
                }))
            );
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/getNode', async (req, res) => {
    try {
        res.json(flowMeta.filter(node => node.value.toLowerCase() === req.body.keyword.toLowerCase())[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/health_check', async (req, res) => {
    try {
        res.status(200).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});