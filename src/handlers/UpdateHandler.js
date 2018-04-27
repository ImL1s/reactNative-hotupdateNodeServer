'use strict';

let fs = require('fs');
import { Observable, Subject, ReplaySubject, from, of, range, from as fromPromise } from 'rxjs';
import { map, filter, switchMap, concatMap, tap, catchError } from 'rxjs/operators';
import { LISTEN_PORT } from '../Constants';


export function handleGetSource(req: Request, resp: Response): Observable<any> {
    return fromPromise(readFile('./public/bundle/config.json'))
        .pipe(
            map(data => JSON.parse(data)),
            map(configJSON => {
                let clientBundleVersion = req.query.bundleVersion;
                let platform = req.query.platform;
                if (!(clientBundleVersion)) {
                    configJSON.errorMessage = 'clientBundleVersion format error';
                } else if (!(platform)) {
                    configJSON.errorMessage = 'platform format error';
                }
                let lastBundleVersion = configJSON.lastVersion.version;
                configJSON.lastBundleVersion = lastBundleVersion;

                configJSON.needUpdate = biggerOrEqualThan(lastBundleVersion, clientBundleVersion);
                configJSON.platform = platform;
                return configJSON;
            }),
            map((configJSON) => {
                if (configJSON.needUpdate) {
                    let clientNativeVersion = req.query.nativeVersion;
                    let { lastVersion } = configJSON;
                    let { minNativeVersion, androidPatchURL, iosPatchURL } = lastVersion;

                    // 將client端的app native版本與當前最新版本需要的app native版本比對,看是否達到升級需求                
                    configJSON.canUpdate = biggerOrEqualThan(clientNativeVersion, minNativeVersion);
                    configJSON.clientNativeVersion = clientNativeVersion;

                    configJSON.patchURL = (configJSON.platform === 'android' ?
                        lastVersion.androidPatchURL :
                        lastVersion.iosPatchURL);
                } else {
                    configJSON.canUpdate = false;
                }
                return configJSON;
            }),
            map(configJSON => {
                if (configJSON.needUpdate && !(configJSON.canUpdate)) {
                    let platform: String = req.query.platform;
                    let versionList: Array = configJSON.versionList;
                    let clientNativeVersion: String = configJSON.clientNativeVersion;

                    versionList.forEach((version, index) => {
                        if (biggerOrEqualThan(version.minNativeVersion, clientNativeVersion)) {
                            configJSON.patchURL = (platform === 'android' ?
                                version.androidPatchURL :
                                version.iosPatchURL);
                            configJSON.lastBundleVersion = version.version;
                        }
                    });
                }
                return configJSON
            }),
            tap(configJSON => {
                if (!(configJSON.errorMessage)) {
                    let { needUpdate, canUpdate, patchURL, platform } = configJSON;
                    let clientBindleVersion = req.query.bundleVersion;
                    let serverDNS = req.hostname;
                    let lastBundleVersion = configJSON.lastBundleVersion;
                    let protocol = req.protocol;

                    patchURL = `${protocol}://${serverDNS}:${LISTEN_PORT}${patchURL}${clientBindleVersion}-${lastBundleVersion}.patch.zip`;
                    resp.json({
                        canUpdate,
                        needUpdate,
                        patchURL,
                        platform
                    });
                } else {
                    resp.status = 400;
                    resp.json({
                        message: configJSON.errorMessage
                    });
                }
            }, err => {
                console.log(err);
                resp.status = 400;
                resp.json({
                    message: err
                });
            }, () => {
                console.log('handled api: update');
            })
        );
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


function biggerOrEqualThan(beCompared: String, other: String): boolean {
    console.log(beCompared + '/' + other);
    if (!beCompared || !other) {
        console.log('canUpdate format error');
        return false;
    }
    let beComparedArray = beCompared.split('.');
    if (beComparedArray.length < 3 || beComparedArray.length > 3) {
        console.log('beCompared format error');
        return false;
    }
    let otherArray = other.split('.');
    if (otherArray.length < 3 || otherArray.length > 3) {
        console.log('other format error');
        return false;
    }

    beComparedArray.forEach((value, index) => {
        let otherNumber = parseInt(otherArray[index]);
        let beComparedNumber = parseInt(value);
        if (beComparedNumber < otherNumber) {
            return false;
        } else if (beComparedNumber > otherNumber) {
            return true;
        }
    });
    return true;
} 
