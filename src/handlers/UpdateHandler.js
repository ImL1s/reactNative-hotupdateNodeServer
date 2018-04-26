'use strict';

let fs = require('fs');
import { Observable, Subject, ReplaySubject, from, of, range, from as fromPromise } from 'rxjs';
import { map, filter, switchMap, concatMap } from 'rxjs/operators';


export function handle(req: Request, resp: Response) {
    fromPromise(readFile('./public/bundle/config.json'))
        .pipe(map(data => JSON.parse(data)))
        .pipe(map(configJSON => {
            let bundleVersion = req.params;
            return configJSON;
        }))
        .pipe(map((configJSON) => {
            let clientNativeVersion = req.query.nativeVersion;
            let lastNativeVersion = configJSON.lastVersion.minNativeVersion;
            // 將client端的app native版本與當前最新版本需要的app native版本比對,看是否達到升級需求
            configJSON.canUpdate = canUpdate(clientNativeVersion,lastNativeVersion);
            return configJSON;
        })).subscribe(
            configJSON => {
                resp.json(JSON.stringify(configJSON));
            }, err => {
                console.log(err);
            }, () => {
                console.log('handled api: update');
            });
}


const readFile = (path, opts = 'utf8') =>
    new Promise((res, rej) => {
        fs.readFile(path, opts, (err, data) => {
            if (err) {
                rej(err);
            }
            else {
                res(data);
            }
        })
    });

function canUpdate(clientNativeVersion: String, nativeMinVersion: String): boolean{
    console.log(clientNativeVersion + '/' + nativeMinVersion);
    if (!clientNativeVersion || !nativeMinVersion) {
        console.log('canUpdate format error');
        return false;
    }
    let clientVersionArray = clientNativeVersion.split('.');
    if (clientVersionArray.length < 3 || clientVersionArray.length > 3) {
        console.log('clientNativeVersion format error');
        return false;
    }
    let lastVersionArray = nativeMinVersion.split('.');
    if (lastVersionArray.length < 3 || lastVersionArray.length > 3) {
        console.log('lastNativeVersion format error');
        return false;
    }

    clientVersionArray.forEach((value, index) => {
        let lastMinNumber = parseInt(lastVersionArray[index]);
        let clientNumber = parseInt(value);
        if (clientNumber < lastMinNumber) {
            return false;
        }
    });
    return true;
} 
