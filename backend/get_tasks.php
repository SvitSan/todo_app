<?php
header('Content-Type: application/json; charset=utf-8');
include 'db.php';

// Note: Ensure the 'status' column in your MySQL table stores one of these values:
// backlog, progress, complete, on_hold

$result = $conn->query("SELECT id, title, status FROM tasks ORDER BY id DESC");
$tasks = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        // Map 'on_hold' from DB back to 'on-hold' for consistent JS usage if needed
        // $row['status'] = str_replace('_', '-', $row['status']); 
        $tasks[] = $row;
    }
}

echo json_encode($tasks);
?>
