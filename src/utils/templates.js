/**
 * Schema Templates — Pre-built database patterns for common use cases.
 * Each template returns { tables, connections } ready to import.
 * 
 * Icons are Lucide icon names (resolved at render time).
 */

const mkId = () => Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6);

export const TEMPLATES = [
    {
        id: 'auth',
        name: 'Autenticación',
        description: 'Users, sessions, roles y permisos',
        icon: 'Shield',
        color: '#007AFF',
        build: () => {
            const usersId = mkId();
            const sessionsId = mkId();
            const rolesId = mkId();

            return {
                tables: [
                    {
                        id: usersId, name: 'users', x: 80, y: 80, color: '#007AFF',
                        columns: [
                            { id: usersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: usersId + '-c1', name: 'email', type: 'varchar(255)', pk: false, nullable: false },
                            { id: usersId + '-c2', name: 'password_hash', type: 'varchar(255)', pk: false, nullable: false },
                            { id: usersId + '-c3', name: 'role_id', type: 'int', pk: false, nullable: true },
                            { id: usersId + '-c4', name: 'is_active', type: 'boolean', pk: false, nullable: false, defaultValue: 'true' },
                            { id: usersId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: usersId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: sessionsId, name: 'sessions', x: 450, y: 80, color: '#34C759',
                        columns: [
                            { id: sessionsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: sessionsId + '-c1', name: 'user_id', type: 'int', pk: false, nullable: false },
                            { id: sessionsId + '-c2', name: 'token', type: 'varchar(512)', pk: false, nullable: false },
                            { id: sessionsId + '-c3', name: 'ip_address', type: 'varchar(45)', pk: false, nullable: true },
                            { id: sessionsId + '-c4', name: 'user_agent', type: 'text', pk: false, nullable: true },
                            { id: sessionsId + '-c5', name: 'expires_at', type: 'timestamp', pk: false, nullable: false },
                            { id: sessionsId + '-c6', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: sessionsId + '-c7', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: rolesId, name: 'roles', x: 80, y: 400, color: '#5856D6',
                        columns: [
                            { id: rolesId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: rolesId + '-c1', name: 'name', type: 'varchar(50)', pk: false, nullable: false },
                            { id: rolesId + '-c2', name: 'permissions', type: 'jsonb', pk: false, nullable: true },
                            { id: rolesId + '-c3', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: rolesId + '-c4', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                ],
                connections: [
                    { id: 'conn-' + mkId(), fromTableId: sessionsId, fromColId: sessionsId + '-c1', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: usersId, fromColId: usersId + '-c3', toTableId: rolesId, toColId: rolesId + '-c0', relationType: '1:n' },
                ]
            };
        }
    },
    {
        id: 'blog',
        name: 'Blog / CMS',
        description: 'Posts, categorías, tags y comentarios',
        icon: 'FileText',
        color: '#FF9500',
        build: () => {
            const usersId = mkId();
            const postsId = mkId();
            const categoriesId = mkId();
            const commentsId = mkId();
            const tagsId = mkId();
            const postTagsId = mkId();

            return {
                tables: [
                    {
                        id: usersId, name: 'authors', x: 80, y: 80, color: '#007AFF',
                        columns: [
                            { id: usersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: usersId + '-c1', name: 'name', type: 'varchar(100)', pk: false, nullable: false },
                            { id: usersId + '-c2', name: 'email', type: 'varchar(255)', pk: false, nullable: false },
                            { id: usersId + '-c3', name: 'avatar_url', type: 'text', pk: false, nullable: true },
                            { id: usersId + '-c4', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: usersId + '-c5', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: postsId, name: 'posts', x: 450, y: 80, color: '#FF9500',
                        columns: [
                            { id: postsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: postsId + '-c1', name: 'author_id', type: 'int', pk: false, nullable: false },
                            { id: postsId + '-c2', name: 'category_id', type: 'int', pk: false, nullable: true },
                            { id: postsId + '-c3', name: 'title', type: 'varchar(255)', pk: false, nullable: false },
                            { id: postsId + '-c4', name: 'slug', type: 'varchar(255)', pk: false, nullable: false },
                            { id: postsId + '-c5', name: 'content', type: 'text', pk: false, nullable: true },
                            { id: postsId + '-c6', name: 'status', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'draft'" },
                            { id: postsId + '-c7', name: 'published_at', type: 'timestamp', pk: false, nullable: true },
                            { id: postsId + '-c8', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: postsId + '-c9', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: categoriesId, name: 'categories', x: 450, y: 450, color: '#34C759',
                        columns: [
                            { id: categoriesId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: categoriesId + '-c1', name: 'name', type: 'varchar(100)', pk: false, nullable: false },
                            { id: categoriesId + '-c2', name: 'slug', type: 'varchar(100)', pk: false, nullable: false },
                            { id: categoriesId + '-c3', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: categoriesId + '-c4', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: commentsId, name: 'comments', x: 830, y: 80, color: '#FF3B30',
                        columns: [
                            { id: commentsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: commentsId + '-c1', name: 'post_id', type: 'int', pk: false, nullable: false },
                            { id: commentsId + '-c2', name: 'author_name', type: 'varchar(100)', pk: false, nullable: false },
                            { id: commentsId + '-c3', name: 'body', type: 'text', pk: false, nullable: false },
                            { id: commentsId + '-c4', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: commentsId + '-c5', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: tagsId, name: 'tags', x: 80, y: 450, color: '#FF2D55',
                        columns: [
                            { id: tagsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: tagsId + '-c1', name: 'name', type: 'varchar(50)', pk: false, nullable: false },
                            { id: tagsId + '-c2', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: tagsId + '-c3', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: postTagsId, name: 'post_tags', x: 260, y: 300, color: '#5856D6',
                        columns: [
                            { id: postTagsId + '-c0', name: 'post_id', type: 'int', pk: true, nullable: false },
                            { id: postTagsId + '-c1', name: 'tag_id', type: 'int', pk: true, nullable: false },
                            { id: postTagsId + '-c2', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: postTagsId + '-c3', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                ],
                connections: [
                    { id: 'conn-' + mkId(), fromTableId: postsId, fromColId: postsId + '-c1', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: postsId, fromColId: postsId + '-c2', toTableId: categoriesId, toColId: categoriesId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: commentsId, fromColId: commentsId + '-c1', toTableId: postsId, toColId: postsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: postTagsId, fromColId: postTagsId + '-c0', toTableId: postsId, toColId: postsId + '-c0', relationType: 'n:n' },
                    { id: 'conn-' + mkId(), fromTableId: postTagsId, fromColId: postTagsId + '-c1', toTableId: tagsId, toColId: tagsId + '-c0', relationType: 'n:n' },
                ]
            };
        }
    },
    {
        id: 'ecommerce',
        name: 'E-Commerce',
        description: 'Productos, órdenes, carrito y pagos',
        icon: 'ShoppingCart',
        color: '#34C759',
        build: () => {
            const customersId = mkId();
            const productsId = mkId();
            const ordersId = mkId();
            const orderItemsId = mkId();
            const paymentsId = mkId();

            return {
                tables: [
                    {
                        id: customersId, name: 'customers', x: 80, y: 80, color: '#007AFF',
                        columns: [
                            { id: customersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: customersId + '-c1', name: 'email', type: 'varchar(255)', pk: false, nullable: false },
                            { id: customersId + '-c2', name: 'full_name', type: 'varchar(200)', pk: false, nullable: false },
                            { id: customersId + '-c3', name: 'phone', type: 'varchar(20)', pk: false, nullable: true },
                            { id: customersId + '-c4', name: 'address', type: 'text', pk: false, nullable: true },
                            { id: customersId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: customersId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: productsId, name: 'products', x: 80, y: 400, color: '#FF9500',
                        columns: [
                            { id: productsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: productsId + '-c1', name: 'name', type: 'varchar(200)', pk: false, nullable: false },
                            { id: productsId + '-c2', name: 'description', type: 'text', pk: false, nullable: true },
                            { id: productsId + '-c3', name: 'price', type: 'decimal(10,2)', pk: false, nullable: false },
                            { id: productsId + '-c4', name: 'stock', type: 'int', pk: false, nullable: false, defaultValue: '0' },
                            { id: productsId + '-c5', name: 'sku', type: 'varchar(50)', pk: false, nullable: false },
                            { id: productsId + '-c6', name: 'is_active', type: 'boolean', pk: false, nullable: false, defaultValue: 'true' },
                            { id: productsId + '-c7', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: productsId + '-c8', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: ordersId, name: 'orders', x: 500, y: 80, color: '#34C759',
                        columns: [
                            { id: ordersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: ordersId + '-c1', name: 'customer_id', type: 'int', pk: false, nullable: false },
                            { id: ordersId + '-c2', name: 'status', type: 'varchar(30)', pk: false, nullable: false, defaultValue: "'pending'" },
                            { id: ordersId + '-c3', name: 'total', type: 'decimal(10,2)', pk: false, nullable: false },
                            { id: ordersId + '-c4', name: 'shipping_address', type: 'text', pk: false, nullable: true },
                            { id: ordersId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: ordersId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: orderItemsId, name: 'order_items', x: 500, y: 400, color: '#5856D6',
                        columns: [
                            { id: orderItemsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: orderItemsId + '-c1', name: 'order_id', type: 'int', pk: false, nullable: false },
                            { id: orderItemsId + '-c2', name: 'product_id', type: 'int', pk: false, nullable: false },
                            { id: orderItemsId + '-c3', name: 'quantity', type: 'int', pk: false, nullable: false },
                            { id: orderItemsId + '-c4', name: 'unit_price', type: 'decimal(10,2)', pk: false, nullable: false },
                            { id: orderItemsId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: orderItemsId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: paymentsId, name: 'payments', x: 870, y: 80, color: '#FF2D55',
                        columns: [
                            { id: paymentsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: paymentsId + '-c1', name: 'order_id', type: 'int', pk: false, nullable: false },
                            { id: paymentsId + '-c2', name: 'method', type: 'varchar(30)', pk: false, nullable: false },
                            { id: paymentsId + '-c3', name: 'amount', type: 'decimal(10,2)', pk: false, nullable: false },
                            { id: paymentsId + '-c4', name: 'status', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'pending'" },
                            { id: paymentsId + '-c5', name: 'paid_at', type: 'timestamp', pk: false, nullable: true },
                            { id: paymentsId + '-c6', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: paymentsId + '-c7', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                ],
                connections: [
                    { id: 'conn-' + mkId(), fromTableId: ordersId, fromColId: ordersId + '-c1', toTableId: customersId, toColId: customersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: orderItemsId, fromColId: orderItemsId + '-c1', toTableId: ordersId, toColId: ordersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: orderItemsId, fromColId: orderItemsId + '-c2', toTableId: productsId, toColId: productsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: paymentsId, fromColId: paymentsId + '-c1', toTableId: ordersId, toColId: ordersId + '-c0', relationType: '1:1' },
                ]
            };
        }
    },
    {
        id: 'saas',
        name: 'SaaS Multi-tenant',
        description: 'Organizations, members, plans y billing',
        icon: 'Building2',
        color: '#5856D6',
        build: () => {
            const orgsId = mkId();
            const usersId = mkId();
            const membersId = mkId();
            const plansId = mkId();
            const subsId = mkId();

            return {
                tables: [
                    {
                        id: orgsId, name: 'organizations', x: 80, y: 80, color: '#5856D6',
                        columns: [
                            { id: orgsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: orgsId + '-c1', name: 'name', type: 'varchar(200)', pk: false, nullable: false },
                            { id: orgsId + '-c2', name: 'slug', type: 'varchar(100)', pk: false, nullable: false },
                            { id: orgsId + '-c3', name: 'plan_id', type: 'int', pk: false, nullable: true },
                            { id: orgsId + '-c4', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: orgsId + '-c5', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: usersId, name: 'users', x: 500, y: 80, color: '#007AFF',
                        columns: [
                            { id: usersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: usersId + '-c1', name: 'email', type: 'varchar(255)', pk: false, nullable: false },
                            { id: usersId + '-c2', name: 'password_hash', type: 'varchar(255)', pk: false, nullable: false },
                            { id: usersId + '-c3', name: 'full_name', type: 'varchar(200)', pk: false, nullable: false },
                            { id: usersId + '-c4', name: 'avatar_url', type: 'text', pk: false, nullable: true },
                            { id: usersId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: usersId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: membersId, name: 'org_members', x: 300, y: 350, color: '#34C759',
                        columns: [
                            { id: membersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: membersId + '-c1', name: 'org_id', type: 'int', pk: false, nullable: false },
                            { id: membersId + '-c2', name: 'user_id', type: 'int', pk: false, nullable: false },
                            { id: membersId + '-c3', name: 'role', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'member'" },
                            { id: membersId + '-c4', name: 'joined_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                        ]
                    },
                    {
                        id: plansId, name: 'plans', x: 80, y: 400, color: '#FF9500',
                        columns: [
                            { id: plansId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: plansId + '-c1', name: 'name', type: 'varchar(50)', pk: false, nullable: false },
                            { id: plansId + '-c2', name: 'price_monthly', type: 'decimal(10,2)', pk: false, nullable: false },
                            { id: plansId + '-c3', name: 'max_members', type: 'int', pk: false, nullable: false, defaultValue: '5' },
                            { id: plansId + '-c4', name: 'features', type: 'jsonb', pk: false, nullable: true },
                            { id: plansId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: plansId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: subsId, name: 'subscriptions', x: 700, y: 350, color: '#FF2D55',
                        columns: [
                            { id: subsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: subsId + '-c1', name: 'org_id', type: 'int', pk: false, nullable: false },
                            { id: subsId + '-c2', name: 'plan_id', type: 'int', pk: false, nullable: false },
                            { id: subsId + '-c3', name: 'status', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'active'" },
                            { id: subsId + '-c4', name: 'current_period_start', type: 'timestamp', pk: false, nullable: false },
                            { id: subsId + '-c5', name: 'current_period_end', type: 'timestamp', pk: false, nullable: false },
                            { id: subsId + '-c6', name: 'stripe_sub_id', type: 'varchar(255)', pk: false, nullable: true },
                            { id: subsId + '-c7', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: subsId + '-c8', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                ],
                connections: [
                    { id: 'conn-' + mkId(), fromTableId: membersId, fromColId: membersId + '-c1', toTableId: orgsId, toColId: orgsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: membersId, fromColId: membersId + '-c2', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: orgsId, fromColId: orgsId + '-c3', toTableId: plansId, toColId: plansId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: subsId, fromColId: subsId + '-c1', toTableId: orgsId, toColId: orgsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: subsId, fromColId: subsId + '-c2', toTableId: plansId, toColId: plansId + '-c0', relationType: '1:n' },
                ]
            };
        }
    },
    {
        id: 'social',
        name: 'Red Social',
        description: 'Usuarios, posts, follows, likes y mensajes',
        icon: 'Users',
        color: '#FF2D55',
        build: () => {
            const usersId = mkId();
            const postsId = mkId();
            const followsId = mkId();
            const likesId = mkId();
            const messagesId = mkId();

            return {
                tables: [
                    {
                        id: usersId, name: 'users', x: 80, y: 80, color: '#007AFF',
                        columns: [
                            { id: usersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: usersId + '-c1', name: 'username', type: 'varchar(50)', pk: false, nullable: false },
                            { id: usersId + '-c2', name: 'display_name', type: 'varchar(100)', pk: false, nullable: false },
                            { id: usersId + '-c3', name: 'bio', type: 'text', pk: false, nullable: true },
                            { id: usersId + '-c4', name: 'avatar_url', type: 'text', pk: false, nullable: true },
                            { id: usersId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: usersId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: postsId, name: 'posts', x: 450, y: 80, color: '#FF9500',
                        columns: [
                            { id: postsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: postsId + '-c1', name: 'user_id', type: 'int', pk: false, nullable: false },
                            { id: postsId + '-c2', name: 'content', type: 'text', pk: false, nullable: false },
                            { id: postsId + '-c3', name: 'media_url', type: 'text', pk: false, nullable: true },
                            { id: postsId + '-c4', name: 'likes_count', type: 'int', pk: false, nullable: false, defaultValue: '0' },
                            { id: postsId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: postsId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: followsId, name: 'follows', x: 80, y: 400, color: '#5856D6',
                        columns: [
                            { id: followsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: followsId + '-c1', name: 'follower_id', type: 'int', pk: false, nullable: false },
                            { id: followsId + '-c2', name: 'following_id', type: 'int', pk: false, nullable: false },
                            { id: followsId + '-c3', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: followsId + '-c4', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: likesId, name: 'likes', x: 450, y: 400, color: '#FF3B30',
                        columns: [
                            { id: likesId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: likesId + '-c1', name: 'user_id', type: 'int', pk: false, nullable: false },
                            { id: likesId + '-c2', name: 'post_id', type: 'int', pk: false, nullable: false },
                            { id: likesId + '-c3', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: likesId + '-c4', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: messagesId, name: 'messages', x: 800, y: 200, color: '#34C759',
                        columns: [
                            { id: messagesId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: messagesId + '-c1', name: 'sender_id', type: 'int', pk: false, nullable: false },
                            { id: messagesId + '-c2', name: 'receiver_id', type: 'int', pk: false, nullable: false },
                            { id: messagesId + '-c3', name: 'content', type: 'text', pk: false, nullable: false },
                            { id: messagesId + '-c4', name: 'is_read', type: 'boolean', pk: false, nullable: false, defaultValue: 'false' },
                            { id: messagesId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: messagesId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                ],
                connections: [
                    { id: 'conn-' + mkId(), fromTableId: postsId, fromColId: postsId + '-c1', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: followsId, fromColId: followsId + '-c1', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: followsId, fromColId: followsId + '-c2', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: likesId, fromColId: likesId + '-c1', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: likesId, fromColId: likesId + '-c2', toTableId: postsId, toColId: postsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: messagesId, fromColId: messagesId + '-c1', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: messagesId, fromColId: messagesId + '-c2', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                ]
            };
        }
    },
    {
        id: 'project',
        name: 'Project Management',
        description: 'Proyectos, tareas, equipos y sprints',
        icon: 'KanbanSquare',
        color: '#AF52DE',
        build: () => {
            const projectsId = mkId();
            const tasksId = mkId();
            const teamsId = mkId();
            const teamMembersId = mkId();
            const sprintsId = mkId();
            const pmUsersId = mkId();

            return {
                tables: [
                    {
                        id: pmUsersId, name: 'users', x: 800, y: 80, color: '#FF2D55',
                        columns: [
                            { id: pmUsersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: pmUsersId + '-c1', name: 'email', type: 'varchar(255)', pk: false, nullable: false },
                            { id: pmUsersId + '-c2', name: 'full_name', type: 'varchar(200)', pk: false, nullable: false },
                            { id: pmUsersId + '-c3', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: pmUsersId + '-c4', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: projectsId, name: 'projects', x: 80, y: 80, color: '#5856D6',
                        columns: [
                            { id: projectsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: projectsId + '-c1', name: 'name', type: 'varchar(200)', pk: false, nullable: false },
                            { id: projectsId + '-c2', name: 'description', type: 'text', pk: false, nullable: true },
                            { id: projectsId + '-c3', name: 'team_id', type: 'int', pk: false, nullable: false },
                            { id: projectsId + '-c4', name: 'status', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'active'" },
                            { id: projectsId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: projectsId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: tasksId, name: 'tasks', x: 500, y: 80, color: '#FF9500',
                        columns: [
                            { id: tasksId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: tasksId + '-c1', name: 'project_id', type: 'int', pk: false, nullable: false },
                            { id: tasksId + '-c2', name: 'sprint_id', type: 'int', pk: false, nullable: true },
                            { id: tasksId + '-c3', name: 'assignee_id', type: 'int', pk: false, nullable: true },
                            { id: tasksId + '-c4', name: 'title', type: 'varchar(255)', pk: false, nullable: false },
                            { id: tasksId + '-c5', name: 'description', type: 'text', pk: false, nullable: true },
                            { id: tasksId + '-c6', name: 'status', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'todo'" },
                            { id: tasksId + '-c7', name: 'priority', type: 'varchar(10)', pk: false, nullable: false, defaultValue: "'medium'" },
                            { id: tasksId + '-c8', name: 'due_date', type: 'date', pk: false, nullable: true },
                            { id: tasksId + '-c9', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: tasksId + '-c10', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: teamsId, name: 'teams', x: 80, y: 400, color: '#007AFF',
                        columns: [
                            { id: teamsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: teamsId + '-c1', name: 'name', type: 'varchar(100)', pk: false, nullable: false },
                            { id: teamsId + '-c2', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: teamsId + '-c3', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: teamMembersId, name: 'team_members', x: 300, y: 400, color: '#34C759',
                        columns: [
                            { id: teamMembersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: teamMembersId + '-c1', name: 'team_id', type: 'int', pk: false, nullable: false },
                            { id: teamMembersId + '-c2', name: 'user_id', type: 'int', pk: false, nullable: false },
                            { id: teamMembersId + '-c3', name: 'role', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'member'" },
                            { id: teamMembersId + '-c4', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: teamMembersId + '-c5', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: sprintsId, name: 'sprints', x: 800, y: 300, color: '#AF52DE',
                        columns: [
                            { id: sprintsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: sprintsId + '-c1', name: 'project_id', type: 'int', pk: false, nullable: false },
                            { id: sprintsId + '-c2', name: 'name', type: 'varchar(50)', pk: false, nullable: false },
                            { id: sprintsId + '-c3', name: 'start_date', type: 'date', pk: false, nullable: false },
                            { id: sprintsId + '-c4', name: 'end_date', type: 'date', pk: false, nullable: false },
                            { id: sprintsId + '-c5', name: 'status', type: 'varchar(20)', pk: false, nullable: false, defaultValue: "'planned'" },
                            { id: sprintsId + '-c6', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: sprintsId + '-c7', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                ],
                connections: [
                    { id: 'conn-' + mkId(), fromTableId: projectsId, fromColId: projectsId + '-c3', toTableId: teamsId, toColId: teamsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: tasksId, fromColId: tasksId + '-c1', toTableId: projectsId, toColId: projectsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: tasksId, fromColId: tasksId + '-c2', toTableId: sprintsId, toColId: sprintsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: tasksId, fromColId: tasksId + '-c3', toTableId: pmUsersId, toColId: pmUsersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: teamMembersId, fromColId: teamMembersId + '-c1', toTableId: teamsId, toColId: teamsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: teamMembersId, fromColId: teamMembersId + '-c2', toTableId: pmUsersId, toColId: pmUsersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: sprintsId, fromColId: sprintsId + '-c1', toTableId: projectsId, toColId: projectsId + '-c0', relationType: '1:n' },
                ]
            };
        }
    },
    {
        id: 'analytics',
        name: 'Analytics',
        description: 'Eventos, sesiones y métricas de uso',
        icon: 'BarChart3',
        color: '#FF3B30',
        build: () => {
            const eventsId = mkId();
            const sessionsId = mkId();
            const pagesId = mkId();
            const usersId = mkId();

            return {
                tables: [
                    {
                        id: usersId, name: 'tracked_users', x: 80, y: 80, color: '#007AFF',
                        columns: [
                            { id: usersId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: usersId + '-c1', name: 'anonymous_id', type: 'varchar(255)', pk: false, nullable: false },
                            { id: usersId + '-c2', name: 'external_user_id', type: 'varchar(255)', pk: false, nullable: true },
                            { id: usersId + '-c3', name: 'first_seen', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: usersId + '-c4', name: 'last_seen', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: usersId + '-c5', name: 'properties', type: 'jsonb', pk: false, nullable: true },
                            { id: usersId + '-c6', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: usersId + '-c7', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: sessionsId, name: 'sessions', x: 450, y: 80, color: '#34C759',
                        columns: [
                            { id: sessionsId + '-c0', name: 'id', type: 'serial', pk: true, nullable: false },
                            { id: sessionsId + '-c1', name: 'tracked_user_id', type: 'int', pk: false, nullable: false },
                            { id: sessionsId + '-c2', name: 'started_at', type: 'timestamp', pk: false, nullable: false },
                            { id: sessionsId + '-c3', name: 'ended_at', type: 'timestamp', pk: false, nullable: true },
                            { id: sessionsId + '-c4', name: 'duration_ms', type: 'int', pk: false, nullable: true },
                            { id: sessionsId + '-c5', name: 'utm_source', type: 'varchar(100)', pk: false, nullable: true },
                            { id: sessionsId + '-c6', name: 'utm_medium', type: 'varchar(100)', pk: false, nullable: true },
                            { id: sessionsId + '-c7', name: 'country', type: 'varchar(2)', pk: false, nullable: true },
                            { id: sessionsId + '-c8', name: 'device_type', type: 'varchar(20)', pk: false, nullable: true },
                            { id: sessionsId + '-c9', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: sessionsId + '-c10', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: eventsId, name: 'events', x: 450, y: 420, color: '#FF9500',
                        columns: [
                            { id: eventsId + '-c0', name: 'id', type: 'bigint', pk: true, nullable: false },
                            { id: eventsId + '-c1', name: 'session_id', type: 'int', pk: false, nullable: false },
                            { id: eventsId + '-c2', name: 'name', type: 'varchar(100)', pk: false, nullable: false },
                            { id: eventsId + '-c3', name: 'properties', type: 'jsonb', pk: false, nullable: true },
                            { id: eventsId + '-c4', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: eventsId + '-c5', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                    {
                        id: pagesId, name: 'page_views', x: 80, y: 420, color: '#5856D6',
                        columns: [
                            { id: pagesId + '-c0', name: 'id', type: 'bigint', pk: true, nullable: false },
                            { id: pagesId + '-c1', name: 'session_id', type: 'int', pk: false, nullable: false },
                            { id: pagesId + '-c2', name: 'path', type: 'varchar(500)', pk: false, nullable: false },
                            { id: pagesId + '-c3', name: 'referrer', type: 'text', pk: false, nullable: true },
                            { id: pagesId + '-c4', name: 'load_time_ms', type: 'int', pk: false, nullable: true },
                            { id: pagesId + '-c5', name: 'created_at', type: 'timestamp', pk: false, nullable: false, defaultValue: 'now()' },
                            { id: pagesId + '-c6', name: 'updated_at', type: 'timestamp', pk: false, nullable: true },
                        ]
                    },
                ],
                connections: [
                    { id: 'conn-' + mkId(), fromTableId: sessionsId, fromColId: sessionsId + '-c1', toTableId: usersId, toColId: usersId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: eventsId, fromColId: eventsId + '-c1', toTableId: sessionsId, toColId: sessionsId + '-c0', relationType: '1:n' },
                    { id: 'conn-' + mkId(), fromTableId: pagesId, fromColId: pagesId + '-c1', toTableId: sessionsId, toColId: sessionsId + '-c0', relationType: '1:n' },
                ]
            };
        }
    },
];
