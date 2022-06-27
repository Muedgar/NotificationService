var wb = xlsx.readFile("readexcel.xlsx");

var ws = wb.Sheets[wb.SheetNames[0]];

var data = xlsx.utils.sheet_to_json(ws);
// for(let d in data) {
//     // console.log(JSON.parse(`${d}`));
//     console.log(d);
// }
console.log(data);
console.log(data[0]);
console.log(JSON.parse(JSON.stringify(data[0])));
console.log(data[0]['Row Labels']);
console.log(typeof data[0]['Row Labels']);

{/* <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.26.1/axios.min.js" integrity="sha512-bPh3uwgU5qEMipS/VOmRqynnMXGGSRv+72H/N260MQeXZIK4PG48401Bsby9Nq5P5fz7hy5UGNmC/W1Z51h2GQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.4/xlsx.core.min.js" integrity="sha512-guz6jm9TcLvdhaE5NtzYXG8vcxykUCNPNkVqT9ao2IT0lqQp923ROr2Pip5c7pB+ubuutLKxfEc1wAODydei0g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script>
        document.querySelector("form").addEventListener('submit',(e)=> {
            e.preventDefault();
            console.log(e.target[0].value);
        });
    </script> */}