<?php
header('Content-Type: application/json; charset=utf-8');
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;

// Prepared statement for delete
$stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
if ($stmt) {
    $stmt->bind_param('i', $id);
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
