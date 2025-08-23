-- CreateTable
CREATE TABLE "public"."audit_trail" (
    "id" BIGSERIAL NOT NULL,
    "table_name" VARCHAR(255) NOT NULL,
    "row_id" INTEGER NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(6),
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(6),
    "verified_by" BIGINT,
    "verified_at" TIMESTAMP(6),
    "rejected_by" INTEGER,
    "rejected_at" TIMESTAMP(6),
    "deleted_by" INTEGER,
    "deleted_at" TIMESTAMP(6),
    "ip_address" VARCHAR(45),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "remark" TEXT,
    "status" VARCHAR(50),

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_history" (
    "id" BIGSERIAL NOT NULL,
    "device" VARCHAR(190),
    "operating_system" VARCHAR(190),
    "browser" VARCHAR(190),
    "ip_address" VARCHAR(50),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "location" TEXT,
    "status" VARCHAR(20),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "user_id" INTEGER,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."msg_apis" (
    "id" BIGSERIAL NOT NULL,
    "api_name" VARCHAR(255) NOT NULL,
    "api_type" VARCHAR(10) NOT NULL,
    "base_url" TEXT NOT NULL,
    "params" TEXT,
    "method" VARCHAR(6) NOT NULL,
    "status" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "serial_no" INTEGER,

    CONSTRAINT "msg_apis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."msg_contents" (
    "id" SERIAL NOT NULL,
    "message_type" VARCHAR(255),
    "send_sms" VARCHAR(10) DEFAULT 'Yes',
    "send_whatsapp" VARCHAR(10) DEFAULT 'Yes',
    "send_email" VARCHAR(10) DEFAULT 'Yes',
    "send_notification" VARCHAR(10) DEFAULT 'No',
    "sms_template_id" VARCHAR(255),
    "sms_content" TEXT,
    "whatsapp_content" TEXT,
    "mail_subject" VARCHAR(255),
    "mail_content" TEXT,
    "notification_title" VARCHAR(255),
    "notification_content" TEXT,
    "keywords" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "serial_no" INTEGER,

    CONSTRAINT "msg_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."msg_logs" (
    "id" BIGSERIAL NOT NULL,
    "api_id" BIGINT NOT NULL,
    "numbers" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "base_url" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "api_response" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "msg_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."msg_signature" (
    "id" BIGSERIAL NOT NULL,
    "signature_type" VARCHAR(10) NOT NULL,
    "signature" TEXT NOT NULL,
    "status" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "msg_signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_verifications" (
    "id" SERIAL NOT NULL,
    "otp" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "is_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6),
    "user_id" INTEGER,
    "type" VARCHAR(10),

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "status" VARCHAR(8) DEFAULT 'Active',
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "serial_no" INTEGER,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_pricing" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'INR',
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "serial_no" INTEGER,

    CONSTRAINT "product_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(255),
    "status" VARCHAR(8) DEFAULT 'Active',
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "serial_no" INTEGER,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_switchings" (
    "id" BIGSERIAL NOT NULL,
    "api_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "api_code" VARCHAR(50) NOT NULL,
    "rate" VARCHAR(10) NOT NULL,
    "commission_surcharge" VARCHAR(50) NOT NULL,
    "flat_per" VARCHAR(50) NOT NULL,
    "gst" INTEGER NOT NULL,
    "tds" INTEGER NOT NULL,
    "txn_limit" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "serial_no" INTEGER,

    CONSTRAINT "service_switchings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."temp_users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(190) NOT NULL,
    "email" VARCHAR(190) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "mobile_no" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "email_otp" VARCHAR(10),
    "mobile_otp" VARCHAR(10),
    "is_email_verified" BOOLEAN DEFAULT false,
    "is_mobile_verified" BOOLEAN DEFAULT false,

    CONSTRAINT "temp_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "uuid" INTEGER NOT NULL,
    "name" VARCHAR(190) NOT NULL,
    "email" VARCHAR(190) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "mobile_no" VARCHAR(20) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "otp_status" VARCHAR(50) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "balance" DOUBLE PRECISION DEFAULT 0.0,
    "lien_balance" DOUBLE PRECISION DEFAULT 0.0,
    "free_balance" DOUBLE PRECISION DEFAULT 100.0,
    "balance_expire_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhooks" (
    "id" BIGSERIAL NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "url" TEXT,
    "event" VARCHAR(100),
    "secret_key" VARCHAR(255),
    "status" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_ip_whitelist" (
    "id" BIGSERIAL NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "status" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_ip_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "token_type" VARCHAR(10) NOT NULL,
    "expires_at" TIMESTAMP(6),
    "status" VARCHAR(8) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."apis" (
    "id" BIGSERIAL NOT NULL,
    "api_name" VARCHAR NOT NULL,
    "api_type" VARCHAR NOT NULL,
    "remain_balance" VARCHAR(50),
    "pending_txn_limit" INTEGER,
    "auth_key1" TEXT,
    "auth_value1" TEXT,
    "auth_key2" TEXT,
    "auth_value2" TEXT,
    "auth_key3" TEXT,
    "auth_value3" TEXT,
    "auth_key4" TEXT,
    "auth_value4" TEXT,
    "auth_key5" TEXT,
    "auth_value5" TEXT,
    "auth_key6" TEXT,
    "auth_value6" TEXT,
    "auto_status_check" VARCHAR(8),
    "status" VARCHAR(50),
    "deleted" VARCHAR(3) DEFAULT 'No',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "apis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user_id_type" ON "public"."otp_verifications"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "public"."product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "public"."product_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "public"."products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "unique_category_name" ON "public"."products"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "temp_users_email_key" ON "public"."temp_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "public"."users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "public"."wallets"("user_id");

-- AddForeignKey
ALTER TABLE "public"."msg_logs" ADD CONSTRAINT "fk_msg_logs_api" FOREIGN KEY ("api_id") REFERENCES "public"."msg_apis"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."otp_verifications" ADD CONSTRAINT "fk_temp_user" FOREIGN KEY ("user_id") REFERENCES "public"."temp_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."product_pricing" ADD CONSTRAINT "product_pricing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."service_switchings" ADD CONSTRAINT "fk_api" FOREIGN KEY ("api_id") REFERENCES "public"."apis"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."service_switchings" ADD CONSTRAINT "fk_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."wallets" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_tokens" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
