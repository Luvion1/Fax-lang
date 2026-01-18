let mut master_data = 100;

{
    shadow view = master_data;
    let increment = 5;
    master_data = master_data + increment;
} 

let final_val = if master_data > 100 {
    master_data
} else {
    0
};

return final_val;