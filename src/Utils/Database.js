import SQLite from 'react-native-sqlite-storage';
import moment from 'moment';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "offline.db";
const database_version = "1.0";
const database_displayname = "SQLite Offline Database";
const database_size = 200000;

export default class Database {
    initDB() {
        let db;
        return new Promise((resolve) => {
            console.log("Plugin integrity check ...");
            SQLite.echoTest()
                .then(() => {
                    console.log("Integrity check passed ...");
                    console.log("Opening database ...");
                    SQLite.openDatabase(
                        database_name,
                        database_version,
                        database_displayname,
                        database_size
                    )
                        .then(DB => {
                            db = DB;
                            console.log("Database OPEN");
                            db.executeSql('SELECT 1 FROM Weather LIMIT 1').then(() => {
                                console.log("Database is ready ... executing query ...");
                            }).catch((error) => {
                                console.log("Received error: ", error);
                                console.log("Database not yet ready ... populating data");
                                db.transaction((tx) => {
                                    tx.executeSql('CREATE TABLE IF NOT EXISTS Weather (id INTEGER PRIMARY KEY, temp, weather, min, max, recordDate)');
                                }).then(() => {
                                    console.log("Table created successfully");
                                }).catch(error => {
                                    console.log(error);
                                });
                            });
                            resolve(db);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                })
                .catch(error => {
                    console.log("echoTest failed - plugin not functional");
                });
        });
    };

    closeDatabase(db) {
        if (db) {
            console.log("Closing DB");
            db.close()
                .then(status => {
                    console.log("Database CLOSED");
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            console.log("Database was not OPENED");
        }
    };

    addWeather(item) {
        return new Promise((resolve) => {
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('REPLACE INTO Weather VALUES (?, ?, ?, ?, ?, ?)', [item.id, item.temp, item.weather, item.min, item.max, item.recordDate]).then(([tx, results]) => {
                        resolve(results);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    updateWeather(id, item) {
        return new Promise((resolve) => {
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('UPDATE Weather SET temp = ?, weather = ?, min = ?, max = ?, recordDate = ? WHERE id = ?', [item.temp, item.weather, item.min, item.max, item.recordDate, id]).then(([tx, results]) => {
                        resolve(results);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    deleteWeather(id) {
        return new Promise((resolve) => {
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('DELETE FROM Weather WHERE id = ?', [id]).then(([tx, results]) => {
                        console.log(results);
                        resolve(results);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    selectWeather(id){
        return new Promise((resolve) => {
            const data = [];
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Weather where id = ?', [id]).then(([tx, results]) => {
                        const len = results.rows.length;

                        if (len == 1) {
                            data.temp = results.rows.item(0).temp;
                            data.weather = results.rows.item(0).weather;
                        };
                        console.log(data);
                        resolve(data);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }

    listWeather() {
        const id = moment().format('YYYYMMDD');
        return new Promise((resolve) => {
            const weatherArr = [];
            this.initDB().then((db) => {
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Weather where id >= ? LIMIT 5 ', [id]).then(([tx, results]) => {
                        const len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            const { id, temp, weather, min, max } = row;
                            weatherArr.push({
                                "id": moment(id, 'YYYYMMDD').format('YYYYMMDD'),
                                "date": moment(id, 'YYYYMMDD').format('DD MMM YYYY, ddd'),
                                "temp": temp,
                                "weather": weather,
                                "min": min,
                                "max": max,
                            });
                        }
                        console.log(weatherArr);
                        resolve(weatherArr);
                    });
                }).then((result) => {
                    this.closeDatabase(db);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }
}