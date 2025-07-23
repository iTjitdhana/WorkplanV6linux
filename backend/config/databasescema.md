CREATE DATABASE  IF NOT EXISTS `esp_tracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `esp_tracker`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 192.168.0.94    Database: esp_tracker
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `fg`
--

DROP TABLE IF EXISTS `fg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fg` (
  `id` int NOT NULL AUTO_INCREMENT,
  `FG_Code` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FG_Name` varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FG_Unit` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FG_Size` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=909 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fg_bom`
--

DROP TABLE IF EXISTS `fg_bom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fg_bom` (
  `id` int NOT NULL AUTO_INCREMENT,
  `FG_Code` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Raw_Code` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Raw_Qty` float NOT NULL,
  `Raw_Unit` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=909 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `finished_flags`
--

DROP TABLE IF EXISTS `finished_flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finished_flags` (
  `work_plan_id` int NOT NULL,
  `is_finished` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`work_plan_id`),
  CONSTRAINT `finished_flags_ibfk_1` FOREIGN KEY (`work_plan_id`) REFERENCES `work_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_plan_id` int DEFAULT NULL,
  `process_number` int DEFAULT NULL,
  `status` enum('start','stop') COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `work_plan_id` (`work_plan_id`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`work_plan_id`) REFERENCES `work_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1295 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `machines`
--

DROP TABLE IF EXISTS `machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `machine_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'รหัสเครื่อง',
  `machine_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่อเครื่อง',
  `machine_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ประเภทเครื่อง (NEC, iPad, FUJI, etc.)',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ตำแหน่งที่ตั้งเครื่อง',
  `status` enum('active','inactive','maintenance') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'สถานะเครื่อง',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'รายละเอียดเพิ่มเติม',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `machine_code` (`machine_code`),
  KEY `idx_machine_code` (`machine_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลเครื่องบันทึกข้อมูลการผลิต';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Mat_Id` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Mat_Name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Mat_Unit` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=327 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `process_steps`
--

DROP TABLE IF EXISTS `process_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_code` varchar(20) NOT NULL,
  `job_name` varchar(100) NOT NULL,
  `date_recorded` date NOT NULL,
  `worker_count` int DEFAULT NULL,
  `process_number` int NOT NULL,
  `process_description` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=865 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `production_rooms`
--

DROP TABLE IF EXISTS `production_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'รหัสห้องผลิต',
  `room_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่อห้องผลิต',
  `room_type` enum('hot_kitchen','cold_kitchen','prep_area','storage','other') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ประเภทห้องผลิต',
  `capacity` int DEFAULT NULL COMMENT 'ความจุสูงสุด (จำนวนคน)',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ตำแหน่งที่ตั้งห้อง',
  `status` enum('active','inactive','maintenance') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'สถานะห้อง',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'รายละเอียดเพิ่มเติม',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_code` (`room_code`),
  KEY `idx_room_code` (`room_code`),
  KEY `idx_room_type` (`room_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลห้องผลิต';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `production_statuses`
--

DROP TABLE IF EXISTS `production_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ชื่อสถานะ',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'คำอธิบายสถานะ',
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'สีของสถานะ (hex code)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'สถานะการใช้งาน (1=ใช้งาน, 0=ไม่ใช้งาน)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางสถานะการผลิต';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_code` (`id_code`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_plan_drafts`
--

DROP TABLE IF EXISTS `work_plan_drafts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_plan_drafts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_date` date NOT NULL,
  `job_code` varchar(50) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `job_name` varchar(255) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  `production_room_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_520_ci,
  `workflow_status_id` int NOT NULL DEFAULT '1',
  `operators` json DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `machine_id` (`machine_id`),
  KEY `production_room_id` (`production_room_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_production_date` (`production_date`),
  KEY `idx_job_code` (`job_code`),
  KEY `idx_workflow_status` (`workflow_status_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_work_plan_drafts_date_status` (`production_date`,`workflow_status_id`),
  KEY `idx_work_plan_drafts_job_code` (`job_code`),
  CONSTRAINT `work_plan_drafts_ibfk_1` FOREIGN KEY (`workflow_status_id`) REFERENCES `work_plan_workflow_statuses` (`id`),
  CONSTRAINT `work_plan_drafts_ibfk_2` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`),
  CONSTRAINT `work_plan_drafts_ibfk_3` FOREIGN KEY (`production_room_id`) REFERENCES `production_rooms` (`id`),
  CONSTRAINT `work_plan_drafts_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `work_plan_drafts_ibfk_5` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `work_plan_drafts_with_status`
--

DROP TABLE IF EXISTS `work_plan_drafts_with_status`;
/*!50001 DROP VIEW IF EXISTS `work_plan_drafts_with_status`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `work_plan_drafts_with_status` AS SELECT 
 1 AS `id`,
 1 AS `production_date`,
 1 AS `job_code`,
 1 AS `job_name`,
 1 AS `start_time`,
 1 AS `end_time`,
 1 AS `machine_id`,
 1 AS `production_room_id`,
 1 AS `notes`,
 1 AS `workflow_status_id`,
 1 AS `operators`,
 1 AS `created_by`,
 1 AS `updated_by`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `status_code`,
 1 AS `status_name`,
 1 AS `color_code`,
 1 AS `machine_name`,
 1 AS `room_name`,
 1 AS `created_by_name`,
 1 AS `updated_by_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `work_plan_operators`
--

DROP TABLE IF EXISTS `work_plan_operators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_plan_operators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_plan_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `id_code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `work_plan_id` (`work_plan_id`),
  CONSTRAINT `work_plan_operators_ibfk_1` FOREIGN KEY (`work_plan_id`) REFERENCES `work_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=464 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_plan_workflow_statuses`
--

DROP TABLE IF EXISTS `work_plan_workflow_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_plan_workflow_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status_code` varchar(20) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `status_name` varchar(100) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `status_description` text COLLATE utf8mb4_unicode_520_ci,
  `color_code` varchar(10) COLLATE utf8mb4_unicode_520_ci DEFAULT '#000000',
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `status_code` (`status_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_plans`
--

DROP TABLE IF EXISTS `work_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_date` date NOT NULL,
  `job_code` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `job_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `work_plan_drafts_with_status`
--

/*!50001 DROP VIEW IF EXISTS `work_plan_drafts_with_status`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`jitdhana`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `work_plan_drafts_with_status` AS select `wpd`.`id` AS `id`,`wpd`.`production_date` AS `production_date`,`wpd`.`job_code` AS `job_code`,`wpd`.`job_name` AS `job_name`,`wpd`.`start_time` AS `start_time`,`wpd`.`end_time` AS `end_time`,`wpd`.`machine_id` AS `machine_id`,`wpd`.`production_room_id` AS `production_room_id`,`wpd`.`notes` AS `notes`,`wpd`.`workflow_status_id` AS `workflow_status_id`,`wpd`.`operators` AS `operators`,`wpd`.`created_by` AS `created_by`,`wpd`.`updated_by` AS `updated_by`,`wpd`.`created_at` AS `created_at`,`wpd`.`updated_at` AS `updated_at`,`wws`.`status_code` AS `status_code`,`wws`.`status_name` AS `status_name`,`wws`.`color_code` AS `color_code`,`m`.`machine_name` AS `machine_name`,`pr`.`room_name` AS `room_name`,`u1`.`name` AS `created_by_name`,`u2`.`name` AS `updated_by_name` from (((((`work_plan_drafts` `wpd` left join `work_plan_workflow_statuses` `wws` on((`wpd`.`workflow_status_id` = `wws`.`id`))) left join `machines` `m` on((`wpd`.`machine_id` = `m`.`id`))) left join `production_rooms` `pr` on((`wpd`.`production_room_id` = `pr`.`id`))) left join `users` `u1` on((`wpd`.`created_by` = `u1`.`id`))) left join `users` `u2` on((`wpd`.`updated_by` = `u2`.`id`))) where (`wws`.`is_active` = true) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-21 17:02:31
