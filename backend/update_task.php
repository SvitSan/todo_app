<?php
header('Content-Type: application/json; charset=utf-8');
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;
$status = isset($data['status']) ? $data['status'] : '';

// Prepared statement for update
$stmt = $conn->prepare("UPDATE tasks SET status=? WHERE id=?");
if ($stmt) {
    $stmt->bind_param('si', $status, $id);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}
?>
