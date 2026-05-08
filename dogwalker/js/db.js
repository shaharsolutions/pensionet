const DEFAULT_DB = {
    dogs: [
        { id: 1, name: "מקסי", breed: "גולדן רטריבר", owner: "ישראל ישראלי", phone: "050-1234567", status: "active", image: "images/golden.png" },
        { id: 2, name: "לולה", breed: "פודל", owner: "מיכל כהן", phone: "052-7654321", status: "active", image: "images/poodle.png" },
        { id: 3, name: "רוקי", breed: "רועה גרמני", owner: "דוד לוי", phone: "054-9876543", status: "pending", image: "images/shepherd.png" }
    ],
    walks: [
        { id: 101, dogId: 1, time: "08:30", date: "2026-05-05", duration: "30 min", status: "completed" },
        { id: 102, dogId: 2, time: "09:15", date: "2026-05-05", duration: "45 min", status: "completed" },
        { id: 103, dogId: 1, time: "17:00", date: "2026-05-05", duration: "30 min", status: "pending" },
        { id: 104, dogId: 3, time: "18:30", date: "2026-05-05", duration: "60 min", status: "pending" }
    ],
    reports: [
        { id: 201, walkId: 101, pooped: true, peed: true, notes: "היה טיול מצוין, פגשנו חברים בגינה.", timestamp: "2026-05-05T09:00:00" },
        { id: 202, walkId: 102, pooped: false, peed: true, notes: "לולה הייתה קצת עייפה היום.", timestamp: "2026-05-05T10:00:00" }
    ]
};

let DB = JSON.parse(localStorage.getItem('walkie_db')) || DEFAULT_DB;

function saveDB() {
    localStorage.setItem('walkie_db', JSON.stringify(DB));
}
