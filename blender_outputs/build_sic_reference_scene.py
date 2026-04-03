import bpy
import bmesh
import math
import os
import random
from mathutils import Euler, Vector


OUTPUT_DIR = r"D:\Releven\SIC\blender_outputs"
WEB_DIR = r"D:\Releven\SIC\Web"
WEB_ASSETS_DIR = os.path.join(WEB_DIR, "assets")
TEXTURES_DIR = os.path.join(WEB_ASSETS_DIR, "textures")
RENDER_PATH = os.path.join(OUTPUT_DIR, "sic_reference_render.png")
BLEND_PATH = os.path.join(OUTPUT_DIR, "sic_reference_scene.blend")
GLB_PATH = os.path.join(WEB_ASSETS_DIR, "sic_universe_station.glb")


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for datablocks in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.curves,
        bpy.data.cameras,
        bpy.data.lights,
        bpy.data.images,
    ):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def get_node(nodes, node_type):
    for node in nodes:
        if node.type == node_type:
            return node
    raise KeyError(f"Node type not found: {node_type}")


def set_render():
    scene = bpy.context.scene
    engine_ids = [item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    if "CYCLES" in engine_ids:
        scene.render.engine = "CYCLES"
    elif "BLENDER_EEVEE_NEXT" in engine_ids:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    else:
        scene.render.engine = "BLENDER_EEVEE"

    scene.render.resolution_x = 1344
    scene.render.resolution_y = 756
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    if scene.render.engine == "CYCLES":
        scene.cycles.samples = 96
        scene.cycles.preview_samples = 32
        scene.cycles.use_denoising = True
        scene.cycles.max_bounces = 8
        scene.cycles.diffuse_bounces = 4
        scene.cycles.glossy_bounces = 4
        scene.cycles.transmission_bounces = 8
        scene.cycles.transparent_max_bounces = 8
    else:
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 128
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True
        if hasattr(scene.eevee, "gtao_factor"):
            scene.eevee.gtao_factor = 1.6

    if hasattr(scene.eevee, "use_bloom"):
        scene.eevee.use_bloom = True
        scene.eevee.bloom_intensity = 0.03

    world = scene.world
    world.use_nodes = True
    bg = get_node(world.node_tree.nodes, "BACKGROUND")
    bg.inputs[0].default_value = (0.036, 0.033, 0.038, 1.0)
    bg.inputs[1].default_value = 0.06

    scene.render.film_transparent = False
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    scene.view_settings.exposure = 0.38


def make_principled_material(name, color, roughness=0.45, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = get_node(mat.node_tree.nodes, "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def make_glass_material(name, color, roughness=0.08, transmission=0.85, alpha=0.45):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = get_node(mat.node_tree.nodes, "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    elif "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value = transmission
    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = alpha
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = 1.28
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = color
    if "Emission Strength" in bsdf.inputs:
        bsdf.inputs["Emission Strength"].default_value = 0.25
    mat.blend_method = "BLEND"
    if hasattr(mat, "shadow_method"):
        mat.shadow_method = "HASHED"
    return mat


def make_textured_principled_material(
    name,
    base_color=(1.0, 1.0, 1.0, 1.0),
    color_path=None,
    roughness_path=None,
    normal_path=None,
    metallic_path=None,
    uv_scale=(1.0, 1.0),
    roughness=0.45,
    metallic=0.0,
    transmission=0.0,
    alpha=1.0,
    ior=1.45,
    clearcoat=0.0,
    clearcoat_roughness=0.0,
    emission_color=None,
    emission_strength=0.0,
):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = get_node(nodes, "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic

    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    elif "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value = transmission

    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = alpha
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = ior
    if "Clearcoat" in bsdf.inputs:
        bsdf.inputs["Clearcoat"].default_value = clearcoat
    if "Clearcoat Roughness" in bsdf.inputs:
        bsdf.inputs["Clearcoat Roughness"].default_value = clearcoat_roughness
    if "Emission Color" in bsdf.inputs and emission_color is not None:
        bsdf.inputs["Emission Color"].default_value = emission_color
    if "Emission Strength" in bsdf.inputs:
        bsdf.inputs["Emission Strength"].default_value = emission_strength

    tex_coord = nodes.new(type="ShaderNodeTexCoord")
    tex_coord.location = (-860, 0)
    mapping = nodes.new(type="ShaderNodeMapping")
    mapping.location = (-660, 0)
    mapping.inputs["Scale"].default_value = (uv_scale[0], uv_scale[1], 1.0)
    links.new(tex_coord.outputs["UV"], mapping.inputs["Vector"])

    def add_texture_node(label, path, location, colorspace="sRGB"):
        if not path or not os.path.exists(path):
            return None
        image_node = nodes.new(type="ShaderNodeTexImage")
        image_node.name = label
        image_node.label = label
        image_node.image = bpy.data.images.load(path, check_existing=True)
        image_node.image.colorspace_settings.name = colorspace
        image_node.location = location
        links.new(mapping.outputs["Vector"], image_node.inputs["Vector"])
        return image_node

    color_node = add_texture_node("BaseColor", color_path, (-420, 260), "sRGB")
    if color_node:
        links.new(color_node.outputs["Color"], bsdf.inputs["Base Color"])

    roughness_node = add_texture_node("Roughness", roughness_path, (-420, 20), "Non-Color")
    if roughness_node:
        links.new(roughness_node.outputs["Color"], bsdf.inputs["Roughness"])

    metallic_node = add_texture_node("Metallic", metallic_path, (-420, -180), "Non-Color")
    if metallic_node:
        links.new(metallic_node.outputs["Color"], bsdf.inputs["Metallic"])

    normal_node = add_texture_node("Normal", normal_path, (-420, -400), "Non-Color")
    if normal_node:
        normal_map = nodes.new(type="ShaderNodeNormalMap")
        normal_map.location = (-180, -400)
        normal_map.inputs["Strength"].default_value = 0.88 if transmission > 0 else 0.72
        links.new(normal_node.outputs["Color"], normal_map.inputs["Color"])
        links.new(normal_map.outputs["Normal"], bsdf.inputs["Normal"])

    if transmission > 0 or alpha < 1.0:
        mat.blend_method = "BLEND"
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = "HASHED"

    return mat


def make_emission_material(name, color, strength=8.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    for node in list(nodes):
        nodes.remove(node)
    emission = nodes.new(type="ShaderNodeEmission")
    emission.inputs["Color"].default_value = color
    emission.inputs["Strength"].default_value = strength
    out = nodes.new(type="ShaderNodeOutputMaterial")
    links.new(emission.outputs["Emission"], out.inputs["Surface"])
    return mat


def make_image_material(name, image_path, roughness=0.62, metallic=0.0, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = get_node(nodes, "BSDF_PRINCIPLED")
    image_node = nodes.new(type="ShaderNodeTexImage")
    image_node.image = bpy.data.images.load(image_path, check_existing=True)
    image_node.interpolation = "Linear"
    image_node.extension = "CLIP"
    image_node.location = (-420, 120)
    links.new(image_node.outputs["Color"], bsdf.inputs["Base Color"])
    if "Alpha" in image_node.outputs and "Alpha" in bsdf.inputs:
        links.new(image_node.outputs["Alpha"], bsdf.inputs["Alpha"])
        mat.blend_method = "CLIP"
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = "CLIP"
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def assign_material(obj, material):
    if obj.data and hasattr(obj.data, "materials"):
        obj.data.materials.clear()
        obj.data.materials.append(material)


def stylize_mesh(obj, bevel=0.0, bevel_segments=2, subdiv=0, weighted_normal=False):
    if not obj or obj.type != "MESH":
        return obj

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
    if hasattr(obj.data, "auto_smooth_angle"):
        obj.data.auto_smooth_angle = math.radians(48)

    if bevel > 0:
        bevel_mod = obj.modifiers.new(name="Round", type="BEVEL")
        bevel_mod.width = bevel
        bevel_mod.segments = bevel_segments
        bevel_mod.limit_method = "ANGLE"
        bevel_mod.angle_limit = math.radians(34)
        bevel_mod.profile = 0.72
        if hasattr(bevel_mod, "miter_outer"):
            bevel_mod.miter_outer = "MITER_ARC"

    if subdiv > 0:
        subdiv_mod = obj.modifiers.new(name="Soft", type="SUBSURF")
        subdiv_mod.levels = subdiv
        subdiv_mod.render_levels = subdiv
        subdiv_mod.quality = 2

    if weighted_normal:
        wn_mod = obj.modifiers.new(name="Weighted", type="WEIGHTED_NORMAL")
        if hasattr(wn_mod, "keep_sharp"):
            wn_mod.keep_sharp = True

    return obj


def add_cube(name, location, scale, material=None, rotation=(0.0, 0.0, 0.0), parent=None):
    spawn_location = (0.0, 0.0, 0.0) if parent else location
    spawn_rotation = (0.0, 0.0, 0.0) if parent else rotation
    bpy.ops.mesh.primitive_cube_add(location=spawn_location, rotation=spawn_rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    obj.scale = scale
    if material:
        assign_material(obj, material)
    return obj


def add_cylinder(name, location, radius, depth, material=None, rotation=(0.0, 0.0, 0.0), vertices=32, parent=None):
    spawn_location = (0.0, 0.0, 0.0) if parent else location
    spawn_rotation = (0.0, 0.0, 0.0) if parent else rotation
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=spawn_location,
        rotation=spawn_rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    if material:
        assign_material(obj, material)
    return obj


def add_ico(name, location, radius, scale=(1.0, 1.0, 1.0), material=None, rotation=(0.0, 0.0, 0.0), subdivisions=2, parent=None):
    spawn_location = (0.0, 0.0, 0.0) if parent else location
    spawn_rotation = (0.0, 0.0, 0.0) if parent else rotation
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=subdivisions,
        radius=radius,
        location=spawn_location,
        rotation=spawn_rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    obj.scale = scale
    if material:
        assign_material(obj, material)
    return obj


def add_cone(name, location, radius1, depth, material=None, rotation=(0.0, 0.0, 0.0), radius2=0.0, vertices=8, parent=None):
    spawn_location = (0.0, 0.0, 0.0) if parent else location
    spawn_rotation = (0.0, 0.0, 0.0) if parent else rotation
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius1,
        radius2=radius2,
        depth=depth,
        location=spawn_location,
        rotation=spawn_rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    if material:
        assign_material(obj, material)
    return obj


def add_torus(name, location, major_radius, minor_radius, material=None, rotation=(0.0, 0.0, 0.0), major_segments=32, minor_segments=12, parent=None):
    spawn_location = (0.0, 0.0, 0.0) if parent else location
    spawn_rotation = (0.0, 0.0, 0.0) if parent else rotation
    bpy.ops.mesh.primitive_torus_add(
        major_segments=major_segments,
        minor_segments=minor_segments,
        major_radius=major_radius,
        minor_radius=minor_radius,
        location=spawn_location,
        rotation=spawn_rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    if material:
        assign_material(obj, material)
    return obj


def add_text(name, body, location, rotation, size, material=None, parent=None, extrude=0.02):
    spawn_location = (0.0, 0.0, 0.0) if parent else location
    spawn_rotation = (0.0, 0.0, 0.0) if parent else rotation
    bpy.ops.object.text_add(location=spawn_location, rotation=spawn_rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.body = body
    obj.data.size = size
    obj.data.extrude = extrude
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    if material:
        assign_material(obj, material)
    return obj


def add_plane(name, location, scale, material=None, rotation=(0.0, 0.0, 0.0), parent=None):
    spawn_location = (0.0, 0.0, 0.0) if parent else location
    spawn_rotation = (0.0, 0.0, 0.0) if parent else rotation
    bpy.ops.mesh.primitive_plane_add(location=spawn_location, rotation=spawn_rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation
    obj.scale = scale
    if material:
        assign_material(obj, material)
    return obj


def add_tapered_block(name, location, scale, material=None, rotation=(0.0, 0.0, 0.0), parent=None, top_scale=(0.76, 0.76), top_offset=(0.0, 0.0)):
    mesh = bpy.data.meshes.new(f"{name}_mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.location = location
    obj.rotation_euler = rotation

    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2.0)

    for vert in bm.verts:
        top = vert.co.z > 0.0
        vert.co.x *= scale[0] * (top_scale[0] if top else 1.0)
        vert.co.y *= scale[1] * (top_scale[1] if top else 1.0)
        vert.co.z *= scale[2]
        if top:
            vert.co.x += top_offset[0]
            vert.co.y += top_offset[1]

    bm.to_mesh(mesh)
    bm.free()

    if material:
        assign_material(obj, material)
    return obj


def add_polyline(name, points, width, material):
    curve = bpy.data.curves.new(name=name, type="CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = width
    curve.bevel_resolution = 0
    spline = curve.splines.new(type="POLY")
    spline.points.add(len(points) - 1)
    for index, point in enumerate(points):
        spline.points[index].co = (point[0], point[1], point[2], 1.0)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def make_train_body(name, location, rotation_z, body_mat, trim_mat, glass_mat):
    mesh = bpy.data.meshes.new(f"{name}_mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (0.0, 0.0, rotation_z)

    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2.0)

    for vert in bm.verts:
        vert.co.x *= 2.55
        vert.co.y *= 0.82
        vert.co.z *= 0.74
        if vert.co.z > 0:
            vert.co.y *= 0.74
            vert.co.z *= 0.88
        if vert.co.x > 0:
            vert.co.y *= 0.3
            vert.co.z *= 0.84
            vert.co.x += 1.05
        if vert.co.x < -3.4:
            vert.co.y *= 0.92
            vert.co.z *= 0.95

    bmesh.ops.bevel(
        bm,
        geom=list(bm.edges) + list(bm.verts),
        offset=0.07,
        offset_type="OFFSET",
        segments=2,
        profile=0.6,
        affect="EDGES",
    )

    bm.to_mesh(mesh)
    bm.free()
    assign_material(obj, body_mat)

    add_tapered_block(f"{name}_base", (-0.2, 0.0, -0.56), (1.95, 0.76, 0.07), trim_mat, parent=obj, top_scale=(0.92, 0.98))
    add_tapered_block(f"{name}_roof", (-0.65, 0.0, 0.74), (1.48, 0.58, 0.045), trim_mat, parent=obj, top_scale=(0.78, 0.84), top_offset=(0.14, 0.0))
    add_tapered_block(f"{name}_roof_cap", (0.92, 0.0, 0.76), (0.54, 0.46, 0.042), trim_mat, parent=obj, top_scale=(0.56, 0.86), top_offset=(0.08, 0.0))
    add_tapered_block(
        f"{name}_nose_glass",
        (2.92, 0.0, 0.02),
        (0.34, 0.26, 0.34),
        glass_mat,
        rotation=(0.0, math.radians(8), 0.0),
        parent=obj,
        top_scale=(0.58, 0.76),
        top_offset=(0.07, 0.0),
    )
    add_tapered_block(
        f"{name}_window_left",
        (0.12, 0.54, 0.08),
        (1.95, 0.055, 0.29),
        glass_mat,
        parent=obj,
        top_scale=(0.9, 0.66),
        top_offset=(0.08, 0.0),
    )
    add_tapered_block(
        f"{name}_window_right",
        (0.12, -0.54, 0.08),
        (1.95, 0.055, 0.29),
        glass_mat,
        parent=obj,
        top_scale=(0.9, 0.66),
        top_offset=(0.08, 0.0),
    )
    add_tapered_block(
        f"{name}_window_left_front",
        (1.9, 0.42, 0.12),
        (0.46, 0.055, 0.22),
        glass_mat,
        rotation=(0.0, math.radians(-18), 0.0),
        parent=obj,
        top_scale=(0.72, 0.7),
        top_offset=(0.05, 0.0),
    )
    add_tapered_block(
        f"{name}_window_right_front",
        (1.9, -0.42, 0.12),
        (0.46, 0.055, 0.22),
        glass_mat,
        rotation=(0.0, math.radians(-18), 0.0),
        parent=obj,
        top_scale=(0.72, 0.7),
        top_offset=(0.05, 0.0),
    )
    add_tapered_block(f"{name}_trim_left", (-0.18, 0.74, -0.28), (2.34, 0.025, 0.065), trim_mat, parent=obj, top_scale=(0.94, 0.72))
    add_tapered_block(f"{name}_trim_right", (-0.18, -0.74, -0.28), (2.34, 0.025, 0.065), trim_mat, parent=obj, top_scale=(0.94, 0.72))
    add_tapered_block(f"{name}_skid_left", (-0.28, 0.54, -0.56), (1.82, 0.09, 0.05), trim_mat, parent=obj, top_scale=(0.72, 0.82))
    add_tapered_block(f"{name}_skid_right", (-0.28, -0.54, -0.56), (1.82, 0.09, 0.05), trim_mat, parent=obj, top_scale=(0.72, 0.82))
    add_tapered_block(f"{name}_side_fin_left", (1.02, 0.68, -0.18), (0.9, 0.03, 0.14), trim_mat, rotation=(0.0, math.radians(-14), 0.0), parent=obj, top_scale=(0.46, 0.82), top_offset=(0.14, 0.0))
    add_tapered_block(f"{name}_side_fin_right", (1.02, -0.68, -0.18), (0.9, 0.03, 0.14), trim_mat, rotation=(0.0, math.radians(14), 0.0), parent=obj, top_scale=(0.46, 0.82), top_offset=(0.14, 0.0))
    add_tapered_block(f"{name}_nose_fin_left", (2.62, 0.48, -0.12), (0.32, 0.03, 0.18), trim_mat, rotation=(0.0, math.radians(-24), 0.0), parent=obj, top_scale=(0.42, 0.74), top_offset=(0.08, 0.0))
    add_tapered_block(f"{name}_nose_fin_right", (2.62, -0.48, -0.12), (0.32, 0.03, 0.18), trim_mat, rotation=(0.0, math.radians(24), 0.0), parent=obj, top_scale=(0.42, 0.74), top_offset=(0.08, 0.0))
    for index, x in enumerate((-1.0, -0.25, 0.5, 1.18)):
        offset = 0.53
        size_x = 0.06 if index < 3 else 0.04
        add_tapered_block(
            f"{name}_brace_left_{index}",
            (x, offset, 0.12),
            (size_x, 0.03, 0.34),
            trim_mat,
            rotation=(0.0, math.radians(-18), 0.0),
            parent=obj,
            top_scale=(0.72, 0.82),
        )
        add_tapered_block(
            f"{name}_brace_right_{index}",
            (x, -offset, 0.12),
            (size_x, 0.03, 0.34),
            trim_mat,
            rotation=(0.0, math.radians(18), 0.0),
            parent=obj,
            top_scale=(0.72, 0.82),
        )
    return obj


def create_tracks(dark_mat, red_mat, angle, rail_center=(2.2, 0.2, 0.08), rail_length=11.6):
    rail_offset = 0.55

    for side, name in ((rail_offset, "Rail_A"), (-rail_offset, "Rail_B")):
        add_cube(
            name,
            (rail_center[0] - math.sin(angle) * side, rail_center[1] + math.cos(angle) * side, rail_center[2]),
            (rail_length, 0.05, 0.05),
            dark_mat,
            rotation=(0.0, 0.0, angle),
        )

    for index in range(14):
        t = -5.4 + index * 0.9
        x = rail_center[0] + math.cos(angle) * t
        y = rail_center[1] + math.sin(angle) * t
        add_cube(
            f"Sleeper_{index}",
            (x, y, 0.03),
            (0.18, 0.92, 0.03),
            red_mat if index % 3 == 0 else dark_mat,
            rotation=(0.0, 0.0, angle),
        )


def create_ground_lines(dark_mat):
    line_sets = [
        [(-5.85, -3.7, 0.021), (-5.2, -3.05, 0.021), (-4.1, -2.52, 0.021), (-2.92, -1.2, 0.021)],
        [(-5.2, -1.68, 0.021), (-4.26, -1.28, 0.021), (-3.42, -0.78, 0.021), (-2.4, 0.14, 0.021)],
        [(-3.68, 2.62, 0.021), (-2.48, 1.98, 0.021), (-1.35, 1.74, 0.021), (-0.24, 1.1, 0.021)],
        [(-1.94, 1.76, 0.021), (-1.5, 0.92, 0.021), (-0.52, 0.36, 0.021), (0.86, -0.2, 0.021)],
        [(-1.46, -0.98, 0.021), (-0.28, -1.32, 0.021), (0.92, -1.54, 0.021), (2.42, -2.28, 0.021)],
        [(-0.32, -3.24, 0.021), (0.62, -2.64, 0.021), (1.78, -2.14, 0.021), (2.9, -1.7, 0.021)],
        [(0.22, 2.14, 0.021), (1.42, 1.76, 0.021), (2.76, 1.22, 0.021), (4.02, 0.82, 0.021)],
        [(1.22, 3.0, 0.021), (2.18, 2.54, 0.021), (3.28, 2.1, 0.021), (4.42, 1.76, 0.021)],
        [(2.72, -0.26, 0.021), (3.52, -1.06, 0.021), (4.56, -1.34, 0.021), (5.62, -1.94, 0.021)],
        [(3.98, -0.18, 0.021), (4.86, -0.52, 0.021), (6.1, -0.98, 0.021), (6.88, -1.74, 0.021)],
        [(4.74, 2.08, 0.021), (5.42, 1.66, 0.021), (6.12, 1.1, 0.021), (7.0, 0.64, 0.021)],
    ]
    for index, points in enumerate(line_sets):
        add_polyline(f"FloorLine_{index}", points, 0.015, dark_mat)


def create_lamp(name, location, post_mat, glow_mat):
    post = add_cylinder(name, (location[0], location[1], location[2] + 0.95), 0.06, 1.9, post_mat)
    add_ico(f"{name}_bulb", (location[0], location[1], location[2] + 2.0), 0.18, (0.85, 0.85, 1.25), glow_mat)
    light_data = bpy.data.lights.new(f"{name}_light", type="POINT")
    light_data.energy = 650
    light_data.color = (1.0, 0.96, 0.92)
    light = bpy.data.objects.new(f"{name}_light", light_data)
    light.location = (location[0], location[1], location[2] + 2.0)
    bpy.context.collection.objects.link(light)
    return post


def create_bench(name, location, rotation_z, wood_mat, dark_mat):
    def world_offset(dx, dy, dz):
        return (
            location[0] + math.cos(rotation_z) * dx - math.sin(rotation_z) * dy,
            location[1] + math.sin(rotation_z) * dx + math.cos(rotation_z) * dy,
            location[2] + dz,
        )

    for idx, dy in enumerate((-0.11, 0.0, 0.11)):
        add_tapered_block(
            f"{name}_seat_{idx}",
            world_offset(0.0, dy, 0.28 + idx * 0.003),
            (0.58, 0.04, 0.03),
            wood_mat,
            rotation=(0.0, 0.0, rotation_z),
            top_scale=(0.88, 0.82),
        )

    for idx, dy in enumerate((-0.06, 0.06)):
        add_tapered_block(
            f"{name}_back_{idx}",
            world_offset(-0.09, dy, 0.55 + idx * 0.02),
            (0.54, 0.035, 0.028),
            wood_mat,
            rotation=(math.radians(18), 0.0, rotation_z),
            top_scale=(0.84, 0.78),
        )

    leg_offsets = [(-0.35, -0.12), (0.35, -0.12), (-0.35, 0.12), (0.35, 0.12)]
    for idx, (dx, dy) in enumerate(leg_offsets):
        add_cylinder(f"{name}_leg_{idx}", world_offset(dx, dy, 0.14), 0.028, 0.28, dark_mat, rotation=(0.0, 0.0, rotation_z), vertices=10)

    add_cylinder(f"{name}_brace_left", world_offset(-0.18, 0.0, 0.19), 0.022, 0.62, dark_mat, rotation=(math.pi / 2.0, 0.0, rotation_z), vertices=10)
    add_cylinder(f"{name}_brace_right", world_offset(0.18, 0.0, 0.19), 0.022, 0.62, dark_mat, rotation=(math.pi / 2.0, 0.0, rotation_z), vertices=10)


def create_tree(name, location, trunk_mat, foliage_mat, accent_mat):
    trunk = add_cylinder(f"{name}_trunk", (location[0], location[1], location[2] + 0.66), 0.082, 1.32, trunk_mat, vertices=10)
    add_tapered_block(f"{name}_trunk_base", (location[0], location[1], location[2] + 0.1), (0.18, 0.16, 0.09), trunk_mat, top_scale=(0.64, 0.7))
    add_tapered_block(f"{name}_trunk_collar", (location[0], location[1], location[2] + 1.06), (0.12, 0.12, 0.06), trunk_mat, top_scale=(0.72, 0.72))
    crown_specs = [
        (f"{name}_crown", (location[0], location[1], location[2] + 1.62), 0.42, (1.04, 0.94, 1.24), foliage_mat, 2),
        (f"{name}_crown_front", (location[0] - 0.08, location[1] - 0.28, location[2] + 1.48), 0.24, (0.82, 0.78, 0.96), foliage_mat, 1),
        (f"{name}_crown_back", (location[0] + 0.06, location[1] + 0.24, location[2] + 1.5), 0.24, (0.8, 0.82, 0.98), foliage_mat, 1),
        (f"{name}_crown_left", (location[0] - 0.28, location[1] + 0.08, location[2] + 1.46), 0.26, (0.86, 0.86, 1.0), foliage_mat, 1),
        (f"{name}_crown_right", (location[0] + 0.26, location[1] - 0.06, location[2] + 1.5), 0.28, (0.84, 0.82, 1.0), foliage_mat, 1),
        (f"{name}_crown_top", (location[0] + 0.02, location[1], location[2] + 1.94), 0.22, (0.78, 0.72, 0.88), accent_mat, 1),
        (f"{name}_accent_left", (location[0] - 0.18, location[1] - 0.18, location[2] + 1.34), 0.2, (0.78, 0.68, 0.84), accent_mat, 1),
        (f"{name}_accent_right", (location[0] + 0.22, location[1] + 0.14, location[2] + 1.38), 0.2, (0.8, 0.7, 0.86), accent_mat, 1),
    ]
    for crown_name, crown_loc, radius, scale, material, subdivisions in crown_specs:
        add_ico(crown_name, crown_loc, radius, scale, material, subdivisions=subdivisions)

    branch_specs = [
        ((-0.16, -0.04, 1.02), (math.radians(18), math.radians(10), math.radians(112)), 0.34),
        ((0.14, 0.06, 1.08), (math.radians(24), math.radians(-8), math.radians(-84)), 0.36),
        ((0.02, -0.16, 1.16), (math.radians(26), math.radians(4), math.radians(18)), 0.26),
    ]
    for index, (offset, rotation, depth) in enumerate(branch_specs):
        add_tapered_block(
            f"{name}_branch_{index}",
            (location[0] + offset[0], location[1] + offset[1], location[2] + offset[2]),
            (0.05, 0.05, depth),
            trunk_mat,
            rotation=rotation,
            top_scale=(0.42, 0.72),
        )

    leaf_specs = (
        (0.12, 0.34, 0.06, 0.28, 0.02),
        (0.72, 0.26, 0.08, 0.26, 0.02),
        (1.34, 0.24, 0.1, 0.3, 0.03),
        (2.04, 0.28, 0.08, 0.28, 0.02),
        (2.68, 0.3, 0.04, 0.26, 0.02),
        (3.36, 0.26, -0.06, 0.3, 0.03),
        (4.04, 0.24, -0.08, 0.26, 0.02),
        (4.76, 0.22, -0.04, 0.28, 0.02),
        (5.38, 0.28, 0.04, 0.3, 0.03),
    )
    for index, (angle, radius, z_offset, depth, tip_radius) in enumerate(leaf_specs):
        add_cone(
            f"{name}_spike_{index}",
            (
                location[0] + math.cos(angle) * radius,
                location[1] + math.sin(angle) * (radius * 0.88),
                location[2] + 1.66 + z_offset,
            ),
            0.09,
            depth,
            accent_mat if index % 2 else foliage_mat,
            rotation=(math.radians(22), math.radians(4), angle),
            radius2=tip_radius,
            vertices=6,
        )


def create_starburst_tree(name, location, trunk_mat, spike_mat):
    trunk = add_cylinder(f"{name}_trunk", (location[0], location[1], location[2] + 0.72), 0.09, 1.44, trunk_mat, vertices=10)
    add_tapered_block(f"{name}_trunk_base", (location[0], location[1], location[2] + 0.1), (0.18, 0.16, 0.08), trunk_mat, top_scale=(0.66, 0.72))
    core = add_ico(f"{name}_core", (0.0, 0.0, 1.72), 0.3, (1.0, 1.0, 1.0), spike_mat, subdivisions=1, parent=trunk)
    directions = [
        (0.0, 0.0, 0.0),
        (math.radians(38), 0.0, 0.0),
        (math.radians(-38), 0.0, 0.0),
        (0.0, math.radians(38), math.radians(90)),
        (0.0, math.radians(-38), math.radians(90)),
        (math.radians(24), math.radians(20), math.radians(48)),
        (math.radians(-22), math.radians(18), math.radians(122)),
        (math.radians(18), math.radians(-22), math.radians(-38)),
        (math.radians(-18), math.radians(-18), math.radians(180)),
    ]
    for index, rotation in enumerate(directions):
        spike = add_cone(
            f"{name}_spike_{index}",
            (0.0, 0.0, 1.72),
            0.13,
            1.08 if index == 0 else 0.86,
            spike_mat,
            rotation=rotation,
            radius2=0.0,
            vertices=6,
            parent=trunk,
        )
        spike.scale = (1.0, 1.0, 1.0 if index == 0 else 0.82)
    return trunk


def create_city_strip(materials):
    charcoal = materials["charcoal"]
    graphite = materials["graphite"]
    red = materials["red"]
    crimson = materials["crimson"]

    for index, x in enumerate(range(-11, 12)):
        x_pos = x * 0.78
        y_pos = 6.92 + (index % 2) * 0.18
        height = 0.45 + (index % 5) * 0.18
        depth = 0.12 + (index % 3) * 0.05
        width = 0.12 + (index % 4) * 0.04
        mat = red if index % 4 == 0 else graphite if index % 2 else charcoal
        rotation = (0.0, math.radians((index % 3) * 7), math.radians(index * 5))
        if index % 4 == 0:
            add_tapered_block(
                f"CityStrip_Back_{index}",
                (x_pos, y_pos, height / 2.0),
                (width, depth, height / 2.0),
                mat,
                rotation=rotation,
                top_scale=(0.68, 0.82),
                top_offset=(0.0, 0.02),
            )
        elif index % 4 == 1:
            add_cone(
                f"CityStrip_Back_{index}",
                (x_pos, y_pos, height / 2.0),
                max(width, depth) * 1.12,
                height,
                mat,
                rotation=rotation,
                radius2=max(width, depth) * 0.78,
                vertices=6,
            )
        elif index % 4 == 2:
            add_cylinder(
                f"CityStrip_Back_{index}",
                (x_pos, y_pos, height / 2.0),
                max(width, depth) * 0.94,
                height,
                mat,
                rotation=rotation,
                vertices=6,
            )
        else:
            add_tapered_block(
                f"CityStrip_Back_{index}",
                (x_pos, y_pos, height / 2.0),
                (width, depth, height / 2.0),
                mat,
                rotation=rotation,
                top_scale=(0.54, 0.92),
                top_offset=(0.03, 0.0),
            )

    side_specs = [
        ("CityStrip_Left", (-7.98, 1.95, 0.0), math.radians(6)),
        ("CityStrip_Right", (8.34, 0.52, 0.0), math.radians(-18)),
    ]
    for prefix, origin, rot in side_specs:
        for index in range(10):
            height = 0.52 + (index % 4) * 0.22
            width = 0.08 + (index % 2) * 0.04
            depth = 0.1 + (index % 3) * 0.03
            offset = index * 0.46
            x = origin[0] + math.cos(rot) * offset
            y = origin[1] + math.sin(rot) * offset
            mat = crimson if index % 3 == 1 else graphite if index % 2 else charcoal
            rotation = (0.0, math.radians(index * 3 - 6), rot)
            if index % 3 == 0:
                add_tapered_block(
                    f"{prefix}_{index}",
                    (x, y, height / 2.0),
                    (width, depth, height / 2.0),
                    mat,
                    rotation=rotation,
                    top_scale=(0.6, 0.84),
                    top_offset=(0.02, 0.0),
                )
            elif index % 3 == 1:
                add_cone(
                    f"{prefix}_{index}",
                    (x, y, height / 2.0),
                    max(width, depth) * 1.05,
                    height,
                    mat,
                    rotation=rotation,
                    radius2=max(width, depth) * 0.76,
                    vertices=5,
                )
            else:
                add_cylinder(
                    f"{prefix}_{index}",
                    (x, y, height / 2.0),
                    max(width, depth) * 0.9,
                    height,
                    mat,
                    rotation=rotation,
                    vertices=6,
                )


def create_crystal_cluster(glass_mat, dark_mat, red_mat, core_mat=None):
    center = Vector((1.36, 3.08, 0.0))
    add_cylinder("Crystal_Base", (center.x, center.y, 0.36), 0.98, 0.16, dark_mat, vertices=10)
    add_cylinder("Crystal_Dais", (center.x, center.y, 0.74), 0.68, 0.14, dark_mat, vertices=10)
    add_tapered_block("Crystal_Base_Core", (center.x, center.y, 0.58), (0.42, 0.42, 0.12), red_mat, top_scale=(0.7, 0.7))
    for index, angle in enumerate([0.0, 0.78, 1.56, 2.34, 3.12, 3.9, 4.68, 5.46]):
        add_tapered_block(
            f"Crystal_Ring_{index}",
            (center.x + math.cos(angle) * 0.54, center.y + math.sin(angle) * 0.54, 0.82),
            (0.08, 0.16, 0.08),
            red_mat if index % 2 else dark_mat,
            rotation=(math.radians(18), 0.0, angle),
            top_scale=(0.54, 0.82),
        )
    for index, angle in enumerate([0.22, 1.25, 2.34, 3.34, 4.26, 5.22]):
        x = center.x + math.cos(angle) * 0.94
        y = center.y + math.sin(angle) * 0.94
        add_tapered_block(
            f"Crystal_Support_{index}",
            (x, y, 0.44),
            (0.07, 0.15, 0.44),
            red_mat if index % 2 else dark_mat,
            rotation=(math.radians(20), 0.0, angle + math.pi / 2.0),
            top_scale=(0.54, 0.84),
        )
        add_tapered_block(
            f"Crystal_Foot_{index}",
            (x, y, 0.14),
            (0.15, 0.1, 0.08),
            dark_mat,
            rotation=(0.0, 0.0, angle),
            top_scale=(0.72, 0.72),
        )
    for index, angle in enumerate([0.0, 1.58, 3.12, 4.72]):
        x = center.x + math.cos(angle) * 0.56
        y = center.y + math.sin(angle) * 0.56
        add_tapered_block(
            f"Crystal_Brace_{index}",
            (x, y, 0.92),
            (0.08, 0.14, 0.12),
            red_mat if index % 2 else dark_mat,
            rotation=(math.radians(14), 0.0, angle),
            top_scale=(0.62, 0.84),
        )

    crystal_specs = [
        ((center.x, center.y, 2.26), (0.38, 0.38, 1.46), (0.0, 0.0, 0.0)),
        ((center.x - 0.34, center.y - 0.08, 1.96), (0.22, 0.22, 1.1), (math.radians(22), 0.0, math.radians(16))),
        ((center.x + 0.4, center.y - 0.06, 1.9), (0.2, 0.2, 1.02), (math.radians(-14), math.radians(6), math.radians(18))),
        ((center.x - 0.14, center.y + 0.38, 1.78), (0.18, 0.18, 0.98), (math.radians(18), math.radians(10), math.radians(-10))),
        ((center.x + 0.22, center.y + 0.44, 1.74), (0.16, 0.16, 0.96), (math.radians(-18), math.radians(10), math.radians(4))),
        ((center.x - 0.58, center.y + 0.06, 1.54), (0.14, 0.14, 0.88), (math.radians(34), 0.0, math.radians(-18))),
        ((center.x + 0.58, center.y + 0.08, 1.48), (0.14, 0.14, 0.82), (math.radians(-28), 0.0, math.radians(20))),
        ((center.x - 0.06, center.y - 0.54, 1.46), (0.16, 0.16, 0.82), (math.radians(18), math.radians(-10), math.radians(88))),
        ((center.x + 0.12, center.y - 0.38, 1.54), (0.12, 0.12, 0.74), (math.radians(-10), math.radians(8), math.radians(48))),
        ((center.x - 0.46, center.y + 0.32, 1.64), (0.14, 0.14, 0.92), (math.radians(28), math.radians(10), math.radians(-34))),
        ((center.x + 0.48, center.y + 0.28, 1.58), (0.14, 0.14, 0.88), (math.radians(-24), math.radians(10), math.radians(24))),
        ((center.x - 0.28, center.y - 0.44, 1.62), (0.13, 0.13, 0.8), (math.radians(14), math.radians(-18), math.radians(62))),
        ((center.x + 0.24, center.y - 0.48, 1.6), (0.13, 0.13, 0.82), (math.radians(-18), math.radians(16), math.radians(38))),
    ]

    for index, (loc, scl, rot) in enumerate(crystal_specs):
        shard = add_cone(f"Crystal_{index}", loc, 0.48, 1.72, glass_mat, rotation=rot, radius2=0.08, vertices=7)
        shard.scale = scl

    for index, (loc, scl, rot) in enumerate(
        [
            ((center.x + 0.06, center.y + 0.02, 1.82), (0.12, 0.12, 0.84), (math.radians(8), math.radians(18), math.radians(14))),
            ((center.x - 0.08, center.y - 0.04, 1.76), (0.1, 0.1, 0.78), (math.radians(-12), math.radians(-14), math.radians(-18))),
            ((center.x - 0.02, center.y + 0.12, 1.96), (0.08, 0.08, 0.94), (math.radians(4), math.radians(-12), math.radians(22))),
        ]
    ):
        inner = add_cone(f"Crystal_Inner_{index}", loc, 0.24, 1.2, core_mat or red_mat, rotation=rot, radius2=0.02, vertices=6)
        inner.scale = scl


def create_sign(name, location, rotation_z, text, width, height, frame_mat, board_mat, text_mat, post_height=1.3):
    post = add_cylinder(f"{name}_post", (location[0], location[1], location[2] + post_height / 2.0), 0.07, post_height, frame_mat)
    post.rotation_euler = (0.0, 0.0, rotation_z)
    add_tapered_block(f"{name}_board_frame", (0.0, 0.0, post_height / 2.0 + 0.34), (width, 0.075, height), board_mat, parent=post, top_scale=(0.86, 0.78))
    add_tapered_block(f"{name}_board", (0.0, 0.0, post_height / 2.0 + 0.34), (width * 0.92, 0.07, height * 0.84), frame_mat, parent=post, top_scale=(0.8, 0.72))
    text_obj = add_text(
        f"{name}_text",
        text,
        (0.0, 0.08, post_height / 2.0 + 0.34),
        (math.pi / 2.0, 0.0, 0.0),
        0.24,
        text_mat,
        parent=post,
        extrude=0.01,
    )
    text_obj.scale = (0.85, 0.85, 0.85)
    return post


def create_portal_sign(frame_mat, board_mat, text_mat):
    left_post = add_cylinder("Portal_Post_Left", (-3.78, 1.92, 1.38), 0.08, 2.76, frame_mat, vertices=10)
    right_post = add_cylinder("Portal_Post_Right", (-1.02, 1.9, 1.32), 0.08, 2.62, frame_mat, vertices=10)
    add_tapered_block("Portal_Post_Left_Foot", (-3.78, 1.92, 0.1), (0.18, 0.16, 0.08), frame_mat, top_scale=(0.66, 0.72))
    add_tapered_block("Portal_Post_Right_Foot", (-1.02, 1.9, 0.1), (0.18, 0.16, 0.08), frame_mat, top_scale=(0.66, 0.72))
    add_tapered_block("Portal_Top", (-2.42, 1.91, 2.58), (1.54, 0.08, 0.1), frame_mat, top_scale=(0.84, 0.78))
    add_tapered_block("Portal_Top_End_Left", (-3.62, 1.91, 2.58), (0.18, 0.08, 0.12), board_mat, top_scale=(0.44, 0.82), top_offset=(-0.04, 0.0))
    add_tapered_block("Portal_Top_End_Right", (-1.22, 1.91, 2.58), (0.18, 0.08, 0.12), board_mat, top_scale=(0.44, 0.82), top_offset=(0.04, 0.0))
    add_tapered_block("Portal_Board_Frame", (-2.44, 1.91, 2.18), (1.1, 0.065, 0.28), board_mat, top_scale=(0.84, 0.78))
    sign_board = add_tapered_block("Portal_Board", (-2.44, 1.91, 2.18), (1.0, 0.06, 0.22), frame_mat, top_scale=(0.8, 0.74))
    sign_board.rotation_euler = (0.0, 0.0, 0.0)
    add_tapered_block("Portal_Brace_Left", (-3.18, 1.91, 1.84), (0.12, 0.05, 0.58), frame_mat, rotation=(math.radians(-18), 0.0, 0.0), top_scale=(0.46, 0.82))
    add_tapered_block("Portal_Brace_Right", (-1.7, 1.91, 1.84), (0.12, 0.05, 0.58), frame_mat, rotation=(math.radians(-18), 0.0, 0.0), top_scale=(0.46, 0.82))
    add_tapered_block("Portal_Board_Accent_Left", (-2.96, 1.98, 2.18), (0.08, 0.016, 0.18), board_mat, top_scale=(0.48, 0.8))
    add_tapered_block("Portal_Board_Accent_Right", (-1.94, 1.98, 2.18), (0.08, 0.016, 0.18), board_mat, top_scale=(0.48, 0.8))
    text = add_text(
        "Portal_Text",
        "[SIC] LINE - TO: BODY",
        (-2.44, 1.98, 2.18),
        (math.pi / 2.0, 0.0, 0.0),
        0.24,
        text_mat,
        extrude=0.01,
    )
    text.scale = (0.92, 0.92, 0.92)
    return sign_board


def create_border_spikes(name, start, end, count, dark_mat, red_mat, height_base=0.55):
    for index in range(count):
        t = index / max(count - 1, 1)
        x = start[0] + (end[0] - start[0]) * t
        y = start[1] + (end[1] - start[1]) * t
        is_red = index % 3 == 1
        height = height_base + (index % 4) * 0.18
        width = 0.06 + (index % 3) * 0.02
        add_cone(
            f"{name}_{index}",
            (x, y, height / 2.0),
            width * 1.3,
            height,
            red_mat if is_red else dark_mat,
            rotation=(0.0, 0.0, math.radians((index % 5) * 5 - 8)),
            radius2=width * 0.26,
            vertices=4 if index % 2 else 5,
        )


def create_textured_panel(name, image_path, location, rotation, size, frame_mat, lift=0.015, emission=0.18):
    width, height = size
    add_cube(f"{name}_frame", location, (width * 0.54, 0.04, height * 0.54), frame_mat, rotation=rotation)
    image_mat = make_image_material(f"{name}_image", image_path, roughness=0.38, metallic=0.0, emission_strength=emission)
    direction = Vector((0.0, lift, 0.0))
    direction.rotate(Euler(rotation, "XYZ"))
    panel_location = Vector(location) + direction
    return add_plane(
        name,
        tuple(panel_location),
        (width * 0.5, height * 0.5, 1.0),
        image_mat,
        rotation=rotation,
    )


def create_ground_poster(name, image_path, location, rotation_z, size, frame_mat, support_mat):
    width, height = size
    add_cube(
        f"{name}_back",
        (location[0], location[1], location[2] + height * 0.5),
        (width * 0.56, 0.035, height * 0.56),
        frame_mat,
        rotation=(math.radians(76), 0.0, rotation_z),
    )
    panel = create_textured_panel(
        name,
        image_path,
        (location[0], location[1] + 0.01, location[2] + height * 0.52),
        (math.radians(76), 0.0, rotation_z),
        size,
        frame_mat,
        lift=0.03,
        emission=0.24,
    )
    add_cube(
        f"{name}_support",
        (location[0], location[1] - 0.1, location[2] + 0.16),
        (width * 0.18, 0.06, 0.16),
        support_mat,
        rotation=(0.0, 0.0, rotation_z),
    )
    return panel


def create_wall_poster(name, image_path, location, rotation_z, size, frame_mat):
    width, height = size
    add_cube(
        f"{name}_mount",
        location,
        (width * 0.56, 0.04, height * 0.56),
        frame_mat,
        rotation=(math.pi / 2.0, 0.0, rotation_z),
    )
    return create_textured_panel(
        name,
        image_path,
        (location[0], location[1] + 0.025, location[2]),
        (math.pi / 2.0, 0.0, rotation_z),
        size,
        frame_mat,
        lift=0.026,
        emission=0.28,
    )


def create_train_canopy(train_angle, dark_mat, red_mat, glass_mat):
    add_tapered_block("Canopy_Spine", (5.92, 2.06, 1.18), (1.22, 0.5, 0.18), dark_mat, rotation=(0.0, math.radians(11), train_angle), top_scale=(0.72, 0.78), top_offset=(0.18, 0.0))
    add_tapered_block("Canopy_Spine_Cap", (5.96, 2.12, 1.34), (0.92, 0.32, 0.05), red_mat, rotation=(0.0, math.radians(9), train_angle), top_scale=(0.62, 0.84), top_offset=(0.14, 0.0))
    add_tapered_block("Canopy_Wing_A", (5.34, 1.76, 1.0), (0.78, 0.12, 0.12), red_mat, rotation=(math.radians(32), 0.0, train_angle + math.radians(34)), top_scale=(0.48, 0.82), top_offset=(0.18, 0.0))
    add_tapered_block("Canopy_Wing_B", (6.52, 2.5, 1.02), (0.88, 0.12, 0.12), red_mat, rotation=(math.radians(-18), 0.0, train_angle - math.radians(22)), top_scale=(0.44, 0.84), top_offset=(0.22, 0.0))
    add_tapered_block("Canopy_Wing_C", (5.98, 2.18, 0.94), (0.52, 0.1, 0.1), dark_mat, rotation=(math.radians(14), 0.0, train_angle + math.radians(8)), top_scale=(0.42, 0.82), top_offset=(0.12, 0.0))
    add_tapered_block("Canopy_Fin", (6.82, 2.92, 1.32), (0.52, 0.1, 0.4), dark_mat, rotation=(0.0, math.radians(16), train_angle), top_scale=(0.42, 0.86), top_offset=(0.14, 0.0))
    add_tapered_block("Canopy_Glass", (5.52, 1.78, 1.02), (0.46, 0.18, 0.26), glass_mat, rotation=(0.0, math.radians(12), train_angle), top_scale=(0.6, 0.78), top_offset=(0.08, 0.0))
    add_tapered_block("Canopy_Glass_B", (6.2, 2.28, 1.08), (0.42, 0.14, 0.24), glass_mat, rotation=(0.0, math.radians(14), train_angle + math.radians(14)), top_scale=(0.58, 0.8), top_offset=(0.08, 0.0))
    add_tapered_block("Canopy_Rib_A", (5.44, 1.82, 0.9), (0.08, 0.08, 0.56), dark_mat, rotation=(math.radians(-16), 0.0, train_angle + math.radians(18)), top_scale=(0.42, 0.82))
    add_tapered_block("Canopy_Rib_B", (6.16, 2.28, 0.94), (0.08, 0.08, 0.52), dark_mat, rotation=(math.radians(12), 0.0, train_angle - math.radians(12)), top_scale=(0.42, 0.82))
    add_cylinder("Canopy_Post_A", (5.0, 1.5, 0.6), 0.085, 1.2, dark_mat, vertices=10)
    add_cylinder("Canopy_Post_B", (6.38, 2.54, 0.66), 0.085, 1.32, dark_mat, vertices=10)
    add_tapered_block("Canopy_Post_A_Base", (5.0, 1.5, 0.08), (0.16, 0.16, 0.08), red_mat, top_scale=(0.64, 0.74))
    add_tapered_block("Canopy_Post_B_Base", (6.38, 2.54, 0.08), (0.16, 0.16, 0.08), red_mat, top_scale=(0.64, 0.74))


def create_cassette(name, image_path, location, rotation_z, body_mat, trim_mat, reel_mat):
    body = add_tapered_block(
        name,
        (location[0], location[1], location[2] + 0.05),
        (0.24, 0.16, 0.05),
        body_mat,
        rotation=(0.0, 0.0, rotation_z),
        top_scale=(0.92, 0.92),
    )
    add_tapered_block(f"{name}_stripe", (0.0, 0.0, 0.0), (0.26, 0.03, 0.012), trim_mat, parent=body, top_scale=(0.82, 0.82))
    add_tapered_block(f"{name}_window", (0.0, 0.0, 0.008), (0.12, 0.045, 0.006), reel_mat, parent=body, top_scale=(0.88, 0.88))
    for index, x in enumerate((-0.1, 0.1)):
        add_cylinder(
            f"{name}_reel_{index}",
            (x, 0.0, 0.012),
            0.03,
            0.01,
            reel_mat,
            rotation=(math.pi / 2.0, 0.0, 0.0),
            vertices=20,
            parent=body,
        )
        add_cylinder(
            f"{name}_hub_{index}",
            (x, 0.0, 0.013),
            0.012,
            0.014,
            body_mat,
            rotation=(math.pi / 2.0, 0.0, 0.0),
            vertices=12,
            parent=body,
        )
    for index, (x, y) in enumerate(((-0.18, -0.09), (-0.18, 0.09), (0.18, -0.09), (0.18, 0.09))):
        add_cylinder(
            f"{name}_screw_{index}",
            (x, y, 0.048),
            0.01,
            0.008,
            trim_mat,
            rotation=(math.pi / 2.0, 0.0, 0.0),
            vertices=10,
            parent=body,
        )
    add_tapered_block(f"{name}_label_frame", (0.0, 0.0, 0.051), (0.18, 0.075, 0.004), trim_mat, parent=body, top_scale=(0.86, 0.86))
    label_mat = make_image_material(f"{name}_label_image", image_path, roughness=0.4, emission_strength=0.12)
    add_plane(
        f"{name}_label",
        (0.0, 0.0, 0.056),
        (0.16, 0.06, 1.0),
        label_mat,
        rotation=(0.0, 0.0, 0.0),
        parent=body,
    )
    add_tapered_block(f"{name}_foot_left", (-0.16, 0.0, -0.04), (0.03, 0.05, 0.01), trim_mat, parent=body, top_scale=(0.72, 0.82))
    add_tapered_block(f"{name}_foot_right", (0.16, 0.0, -0.04), (0.03, 0.05, 0.01), trim_mat, parent=body, top_scale=(0.72, 0.82))
    return body


def create_card_stack(name, location, rotation_z, top_mat, bottom_mat, dark_mat, image_path=None):
    add_cube(name, (location[0], location[1], location[2] + 0.01), (0.36, 0.24, 0.01), bottom_mat, rotation=(0.0, 0.0, rotation_z))
    top_location = (location[0] + 0.08, location[1] - 0.05, location[2] + 0.03)
    top_rotation = (0.0, 0.0, rotation_z + math.radians(10))
    add_cube(f"{name}_top", top_location, (0.34, 0.22, 0.01), top_mat, rotation=top_rotation)
    if image_path:
        image_mat = make_image_material(f"{name}_image", image_path, roughness=0.48, metallic=0.0)
        add_plane(
            f"{name}_art",
            (top_location[0], top_location[1], top_location[2] + 0.011),
            (0.3, 0.2, 1.0),
            image_mat,
            rotation=(math.pi / 2.0, 0.0, top_rotation[2]),
        )
    else:
        add_text(
            f"{name}_text",
            "[SIC]",
            (location[0] + 0.08, location[1] - 0.05, location[2] + 0.042),
            (math.pi / 2.0, 0.0, rotation_z + math.radians(10)),
            0.18,
            dark_mat,
            extrude=0.004,
        )


def create_suitcase(name, location, rotation_z, body_mat, trim_mat):
    body = add_tapered_block(
        name,
        (location[0], location[1], location[2] + 0.18),
        (0.22, 0.14, 0.18),
        body_mat,
        rotation=(0.0, 0.0, rotation_z),
        top_scale=(0.9, 0.92),
    )
    add_tapered_block(f"{name}_lid", (0.0, 0.0, 0.06), (0.2, 0.12, 0.03), trim_mat, parent=body, top_scale=(0.78, 0.84))
    add_torus(
        f"{name}_handle",
        (0.0, 0.0, 0.18),
        0.05,
        0.012,
        trim_mat,
        rotation=(math.pi / 2.0, 0.0, 0.0),
        major_segments=14,
        minor_segments=6,
        parent=body,
    )
    add_tapered_block(f"{name}_lock", (0.0, 0.0, 0.0), (0.03, 0.05, 0.03), trim_mat, parent=body, top_scale=(0.7, 0.82))
    add_tapered_block(f"{name}_foot_left", (-0.12, 0.0, -0.16), (0.025, 0.04, 0.015), trim_mat, parent=body, top_scale=(0.72, 0.82))
    add_tapered_block(f"{name}_foot_right", (0.12, 0.0, -0.16), (0.025, 0.04, 0.015), trim_mat, parent=body, top_scale=(0.72, 0.82))
    return body


def create_bin(name, location, body_mat, accent_mat):
    body = add_cone(
        name,
        (location[0], location[1], location[2] + 0.26),
        0.11,
        0.5,
        body_mat,
        radius2=0.075,
        vertices=6,
    )
    add_tapered_block(f"{name}_lid", (0.0, 0.0, 0.26), (0.12, 0.12, 0.02), accent_mat, parent=body, top_scale=(0.72, 0.72))
    add_tapered_block(f"{name}_slot", (0.0, 0.06, 0.285), (0.035, 0.01, 0.006), body_mat, parent=body, top_scale=(0.8, 0.8))
    return body


def create_pillar_marker(name, location, body_mat, accent_mat):
    shaft = add_cylinder(name, (location[0], location[1], location[2] + 0.42), 0.1, 0.84, body_mat, vertices=8)
    add_tapered_block(f"{name}_cap", (0.0, 0.0, 0.44), (0.14, 0.14, 0.05), accent_mat, parent=shaft, top_scale=(0.68, 0.76))
    add_tapered_block(f"{name}_base", (0.0, 0.0, -0.44), (0.16, 0.16, 0.06), body_mat, parent=shaft, top_scale=(0.74, 0.82))
    return shaft


def create_terminal_pod(name, location, rotation_z, body_mat, accent_mat):
    body = add_tapered_block(
        name,
        (location[0], location[1], location[2] + 0.24),
        (0.18, 0.12, 0.24),
        body_mat,
        rotation=(0.0, 0.0, rotation_z),
        top_scale=(0.72, 0.82),
    )
    add_tapered_block(f"{name}_screen", (0.0, 0.07, 0.05), (0.1, 0.012, 0.08), accent_mat, parent=body, top_scale=(0.86, 0.86))
    add_tapered_block(f"{name}_base", (0.0, 0.0, -0.22), (0.12, 0.1, 0.03), body_mat, parent=body, top_scale=(0.64, 0.74))
    return body


def create_prop_cluster(materials):
    charcoal = materials["charcoal"]
    graphite = materials["graphite"]
    red = materials["red"]
    cream = materials["cream"]

    create_border_spikes("Fence_Front", (-6.85, -4.08, 0.0), (5.72, -4.36, 0.0), 24, graphite, red, height_base=0.42)
    create_border_spikes("Fence_Left", (-7.04, -4.0, 0.0), (-7.02, 0.62, 0.0), 11, graphite, red, height_base=0.52)
    create_border_spikes("Fence_Right", (6.28, -4.12, 0.0), (8.38, -1.9, 0.0), 10, graphite, red, height_base=0.52)

    add_tapered_block("Terminal_Left", (-1.88, 1.92, 0.18), (0.16, 0.16, 0.18), graphite, top_scale=(0.62, 0.72))
    add_cylinder("Kiosk_A", (-0.22, 2.36, 0.24), 0.12, 0.48, charcoal, vertices=6)
    add_cone("Kiosk_B", (0.54, 2.58, 0.18), 0.12, 0.36, red, radius2=0.08, vertices=5)
    add_tapered_block("Seat_Block", (5.68, 0.2, 0.22), (0.2, 0.12, 0.22), charcoal, top_scale=(0.74, 0.82))
    add_cone("Cone_Marker", (5.86, -2.18, 0.52), 0.12, 1.04, charcoal, radius2=0.02, vertices=4)
    add_tapered_block("Plinth_A", (-5.36, 0.36, 0.24), (0.18, 0.18, 0.24), graphite, top_scale=(0.56, 0.56))
    add_tapered_block("Plinth_B", (6.9, 0.96, 0.26), (0.22, 0.18, 0.26), charcoal, top_scale=(0.6, 0.62))



def stylize_scene_objects():
    skip_prefixes = (
        "VoidBase",
        "Ground",
        "Platform",
        "Back_Platform",
        "Right_Service_Pad",
        "Rail_",
        "Sleeper_",
        "FloorLine_",
    )
    rounded_hero_prefixes = (
        "FrontCar",
        "RearCar",
        "Canopy_",
        "Train_Connector",
        "Platform_Wedge",
        "Crystal_Base",
        "Crystal_Dais",
    )
    rounded_prop_prefixes = (
        "Portal_",
        "Platform_Sign",
        "Mini_Sign",
        "Lamp_",
        "Bench_",
        "Luggage_",
        "Bin_",
        "Pillar_",
        "Seat_",
        "Terminal_",
        "Kiosk_",
        "Plinth_",
        "Cone_",
        "Cassette_",
        "CardStack_",
    )

    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue

        name = obj.name

        if name.startswith(skip_prefixes):
            continue

        if name.startswith("Poster_") or "_label" in name or "_art" in name:
            continue

        if name.startswith(rounded_hero_prefixes):
            stylize_mesh(obj, bevel=0.035, bevel_segments=3, subdiv=1, weighted_normal=True)
            continue

        if name.startswith(rounded_prop_prefixes):
            stylize_mesh(obj, bevel=0.012, bevel_segments=2, subdiv=0, weighted_normal=True)
            continue

        if name.startswith("Tree_") and "_trunk" in name:
            stylize_mesh(obj, bevel=0.008, bevel_segments=2, subdiv=0, weighted_normal=True)
            continue

        if name.startswith("Tree_") and ("_crown" in name or "_accent" in name or "_core" in name):
            stylize_mesh(obj, bevel=0.012, bevel_segments=2, subdiv=1, weighted_normal=True)
            continue

        if name.startswith("Tree_") and "_spike_" in name:
            stylize_mesh(obj, bevel=0.006, bevel_segments=2, subdiv=0, weighted_normal=True)
            continue

        if name.startswith("Crystal_"):
            stylize_mesh(obj, bevel=0.012, bevel_segments=2, subdiv=0, weighted_normal=True)
            continue

        stylize_mesh(obj, bevel=0.006, bevel_segments=2, subdiv=0, weighted_normal=True)


def create_scene():
    random.seed(11)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(WEB_ASSETS_DIR, exist_ok=True)
    clear_scene()
    set_render()

    concrete_color = os.path.join(TEXTURES_DIR, "Concrete032", "Concrete032_1K-JPG_Color.jpg")
    concrete_roughness = os.path.join(TEXTURES_DIR, "Concrete032", "Concrete032_1K-JPG_Roughness.jpg")
    concrete_normal = os.path.join(TEXTURES_DIR, "Concrete032", "Concrete032_1K-JPG_NormalGL.jpg")
    painted_color = os.path.join(TEXTURES_DIR, "PaintedMetal004", "PaintedMetal004_1K-JPG_Color.jpg")
    painted_roughness = os.path.join(TEXTURES_DIR, "PaintedMetal004", "PaintedMetal004_1K-JPG_Roughness.jpg")
    painted_metalness = os.path.join(TEXTURES_DIR, "PaintedMetal004", "PaintedMetal004_1K-JPG_Metalness.jpg")
    painted_normal = os.path.join(TEXTURES_DIR, "PaintedMetal004", "PaintedMetal004_1K-JPG_NormalGL.jpg")
    bark_color = os.path.join(TEXTURES_DIR, "Bark007", "Bark007_1K-JPG_Color.jpg")
    bark_roughness = os.path.join(TEXTURES_DIR, "Bark007", "Bark007_1K-JPG_Roughness.jpg")
    bark_normal = os.path.join(TEXTURES_DIR, "Bark007", "Bark007_1K-JPG_NormalGL.jpg")
    plastic_roughness = os.path.join(TEXTURES_DIR, "Plastic004", "Plastic004_1K-JPG_Roughness.jpg")
    plastic_normal = os.path.join(TEXTURES_DIR, "Plastic004", "Plastic004_1K-JPG_NormalGL.jpg")

    cream = make_textured_principled_material(
        "Cream",
        base_color=(0.965, 0.952, 0.936, 1.0),
        roughness_path=concrete_roughness,
        normal_path=concrete_normal,
        uv_scale=(4.8, 4.8),
        roughness=0.9,
        metallic=0.0,
    )
    charcoal = make_textured_principled_material(
        "Charcoal",
        base_color=(0.05, 0.048, 0.052, 1.0),
        roughness_path=concrete_roughness,
        normal_path=concrete_normal,
        uv_scale=(6.4, 6.4),
        roughness=0.42,
        metallic=0.18,
    )
    graphite = make_textured_principled_material(
        "Graphite",
        base_color=(0.11, 0.105, 0.11, 1.0),
        roughness_path=concrete_roughness,
        normal_path=concrete_normal,
        uv_scale=(5.2, 5.2),
        roughness=0.46,
        metallic=0.12,
    )
    red = make_textured_principled_material(
        "SignalRed",
        color_path=painted_color,
        roughness_path=painted_roughness,
        normal_path=painted_normal,
        metallic_path=painted_metalness,
        uv_scale=(3.0, 3.0),
        roughness=0.32,
        metallic=0.08,
    )
    crimson = make_textured_principled_material(
        "Crimson",
        base_color=(0.76, 0.34, 0.3, 1.0),
        roughness_path=painted_roughness,
        normal_path=painted_normal,
        uv_scale=(4.6, 4.6),
        roughness=0.48,
        metallic=0.02,
    )
    tree_bark = make_textured_principled_material(
        "TreeBark",
        color_path=bark_color,
        roughness_path=bark_roughness,
        normal_path=bark_normal,
        uv_scale=(2.2, 5.8),
        roughness=0.88,
        metallic=0.0,
    )
    glow = make_emission_material("LampGlow", (1.0, 0.98, 0.95, 1.0), strength=12.0)
    red_glow = make_emission_material("RedGlow", (0.92, 0.18, 0.16, 1.0), strength=2.2)
    glass_red = make_textured_principled_material(
        "GlassRed",
        base_color=(0.34, 0.08, 0.1, 1.0),
        roughness_path=plastic_roughness,
        normal_path=plastic_normal,
        uv_scale=(5.6, 5.6),
        roughness=0.08,
        metallic=0.02,
        transmission=0.84,
        alpha=0.46,
        ior=1.24,
        clearcoat=1.0,
        clearcoat_roughness=0.12,
        emission_color=(0.52, 0.08, 0.12, 1.0),
        emission_strength=0.24,
    )
    crystal = make_textured_principled_material(
        "CrystalGlass",
        base_color=(0.97, 0.96, 0.98, 1.0),
        roughness_path=plastic_roughness,
        normal_path=plastic_normal,
        uv_scale=(8.0, 8.0),
        roughness=0.045,
        metallic=0.0,
        transmission=1.0,
        alpha=0.28,
        ior=1.18,
        clearcoat=1.0,
        clearcoat_roughness=0.04,
        emission_color=(0.96, 0.72, 0.76, 1.0),
        emission_strength=0.2,
    )

    materials = {
        "cream": cream,
        "charcoal": charcoal,
        "graphite": graphite,
        "red": red,
        "crimson": crimson,
        "glow": glow,
        "glass_red": glass_red,
        "crystal": crystal,
    }

    poster_assets = {
        "Poster_Ambiguous": os.path.join(WEB_ASSETS_DIR, "sic_phase_iv_ambiguity.png"),
        "Poster_MssWhite": os.path.join(WEB_ASSETS_DIR, "sic_album_mss_white_universe.png"),
        "Poster_DesdeSol": os.path.join(WEB_ASSETS_DIR, "sic_album_desde_sol.png"),
        "Poster_AlReves": os.path.join(WEB_ASSETS_DIR, "sic_album_al_reves.png"),
        "Poster_UniverseMap": os.path.join(WEB_ASSETS_DIR, "sic_universe_map.png"),
    }
    card_assets = {
        "CardStack_Right": os.path.join(WEB_ASSETS_DIR, "sic_symbol_daniel.png"),
        "CardStack_Left": os.path.join(WEB_ASSETS_DIR, "sic_symbol_juan.png"),
    }

    add_cube("VoidBase", (0.0, 0.0, -0.16), (14.0, 10.0, 0.16), charcoal)
    add_cube("Ground", (0.42, 0.0, -0.01), (10.6, 6.9, 0.03), cream)
    add_cube("Platform", (1.12, 0.58, 0.055), (6.7, 4.3, 0.09), cream)
    add_cube("Platform_Shadow", (1.06, 0.54, 0.005), (6.88, 4.48, 0.018), graphite)
    add_cube("Platform_TopInset", (1.24, 0.72, 0.1), (6.02, 3.72, 0.028), cream)
    add_cube("Back_Platform", (1.62, 2.98, 0.17), (3.25, 0.92, 0.17), cream)
    add_cube("Right_Service_Pad", (6.02, 1.18, 0.095), (1.38, 1.64, 0.095), cream)
    add_cube("Right_Service_Pad_Top", (6.02, 1.18, 0.16), (1.14, 1.4, 0.018), graphite)

    train_angle = math.radians(23) + math.pi
    create_tracks(graphite, red, train_angle, rail_center=(2.48, 0.54, 0.08), rail_length=11.9)
    create_ground_lines(graphite)
    create_prop_cluster(materials)
    create_city_strip(materials)

    front_car = make_train_body("FrontCar", (2.9, 0.52, 0.76), train_angle, graphite, red, glass_red)
    rear_car = make_train_body("RearCar", (5.88, 1.82, 0.84), train_angle, graphite, red, glass_red)
    add_tapered_block("Train_Connector", (4.42, 1.16, 0.74), (0.44, 0.42, 0.34), charcoal, rotation=(0.0, 0.0, train_angle), top_scale=(0.82, 0.88))
    add_tapered_block("FrontCar_RoofStrip", (-0.72, 0.0, 0.88), (0.74, 0.08, 0.024), red_glow, parent=front_car, top_scale=(0.72, 0.84))
    add_tapered_block("RearCar_RoofStrip", (-0.84, 0.0, 0.88), (0.82, 0.08, 0.024), red_glow, parent=rear_car, top_scale=(0.72, 0.84))
    add_tapered_block("FrontCar_Door_Frame", (-0.44, 0.68, 0.0), (0.42, 0.02, 0.36), red, parent=front_car, top_scale=(0.62, 0.82))
    add_tapered_block("RearCar_Door_Frame", (-0.34, 0.68, 0.0), (0.38, 0.02, 0.36), red, parent=rear_car, top_scale=(0.62, 0.82))
    add_tapered_block("RearCar_Cap", (2.44, 0.0, 0.08), (0.42, 0.32, 0.3), graphite, parent=rear_car, top_scale=(0.64, 0.8), top_offset=(0.05, 0.0))
    add_tapered_block("FrontCar_FrontTrim", (2.96, 0.0, -0.38), (0.09, 0.64, 0.035), red, parent=front_car, top_scale=(0.8, 0.76))
    add_tapered_block("FrontCar_Window_Frame", (0.3, 0.58, 0.14), (2.12, 0.03, 0.3), red, parent=front_car, top_scale=(0.88, 0.74), top_offset=(0.06, 0.0))
    add_tapered_block("RearCar_Window_Frame", (0.14, 0.58, 0.14), (2.12, 0.03, 0.3), red, parent=rear_car, top_scale=(0.88, 0.74), top_offset=(0.06, 0.0))

    add_tapered_block("Platform_Wedge", (6.22, 2.28, 0.66), (0.88, 0.38, 0.62), red, rotation=(0.0, math.radians(10), train_angle), top_scale=(0.72, 0.68), top_offset=(0.12, 0.0))
    add_tapered_block("Platform_Wedge_Trim", (6.24, 2.32, 1.0), (0.82, 0.32, 0.05), graphite, rotation=(0.0, math.radians(10), train_angle), top_scale=(0.74, 0.76))
    add_tapered_block("Platform_Wedge_Glass", (5.92, 2.08, 0.98), (0.4, 0.14, 0.26), glass_red, rotation=(0.0, math.radians(8), train_angle), top_scale=(0.64, 0.76), top_offset=(0.08, 0.0))
    create_train_canopy(train_angle, graphite, red, glass_red)

    create_crystal_cluster(crystal, graphite, red, core_mat=red_glow)
    create_portal_sign(charcoal, red, cream)
    create_sign("Platform_Sign", (3.94, -0.92, 0.0), math.radians(8), "[SIC] - PLATFORM 3", 0.94, 0.2, charcoal, red, cream, post_height=0.92)
    create_sign("Mini_Sign_A", (-5.54, -3.14, 0.0), math.radians(18), "[SIC]", 0.28, 0.22, charcoal, red, cream, post_height=0.78)
    create_sign("Mini_Sign_B", (6.92, -2.6, 0.0), math.radians(-18), "[SIC]", 0.28, 0.22, charcoal, graphite, cream, post_height=0.78)

    for index, loc in enumerate([(-2.44, -0.94, 0.0), (-0.28, 0.34, 0.0), (2.84, -0.34, 0.0), (5.68, 0.94, 0.0), (6.54, -0.08, 0.0)]):
        create_lamp(f"Lamp_{index}", loc, charcoal, glow)

    bench_specs = [
        ("Bench_A", (-4.92, -2.72, 0.0), math.radians(18)),
        ("Bench_B", (-1.08, -3.38, 0.0), math.radians(22)),
        ("Bench_C", (2.36, -3.08, 0.0), math.radians(18)),
        ("Bench_D", (-3.78, 0.42, 0.0), math.radians(18)),
        ("Bench_E", (0.86, -1.4, 0.0), math.radians(-4)),
        ("Bench_F", (5.96, -0.34, 0.0), math.radians(18)),
        ("Bench_G", (6.02, 0.78, 0.0), math.radians(18)),
    ]
    for name, loc, rot in bench_specs:
        create_bench(name, loc, rot, red, charcoal)

    create_suitcase("Luggage_A", (-4.08, -2.42, 0.0), math.radians(8), charcoal, red)
    create_suitcase("Luggage_B", (-4.44, -2.58, 0.0), math.radians(-12), red, cream)
    create_bin("Bin_A", (-2.18, -2.08, 0.0), red, charcoal)
    create_bin("Bin_B", (6.1, 0.78, 0.0), charcoal, red)
    create_pillar_marker("Pillar_A", (5.88, -2.1, 0.0), charcoal, red)
    create_pillar_marker("Pillar_B", (-0.16, 2.66, 0.0), charcoal, graphite)
    create_terminal_pod("Seat_Console", (0.06, 2.9, 0.0), math.radians(4), red, cream)
    create_terminal_pod("Terminal_Box", (-6.14, -1.32, 0.0), math.radians(6), charcoal, red)
    create_terminal_pod("Terminal_Box_B", (7.42, -0.12, 0.0), math.radians(-12), graphite, cream)

    create_tree("Tree_Left_Red", (-5.08, 0.74, 0.0), tree_bark, crimson, red)
    create_starburst_tree("Tree_Left_Black", (-6.58, 0.84, 0.0), tree_bark, charcoal)
    create_tree("Tree_Right_Red", (7.92, -0.24, 0.0), tree_bark, red, crimson)
    create_tree("Tree_Right_Black", (7.02, 0.82, 0.0), tree_bark, graphite, charcoal)
    create_tree("Tree_Right_Front", (6.82, 1.82, 0.0), tree_bark, crimson, red)

    create_ground_poster("Poster_Ambiguous", poster_assets["Poster_Ambiguous"], (-6.22, -1.66, 0.0), math.radians(6), (0.52, 0.72), charcoal, red)
    create_ground_poster("Poster_MssWhite", poster_assets["Poster_MssWhite"], (-5.5, -2.98, 0.0), math.radians(18), (0.44, 0.62), charcoal, graphite)
    create_ground_poster("Poster_DesdeSol", poster_assets["Poster_DesdeSol"], (-0.22, -1.58, 0.0), math.radians(-5), (0.44, 0.62), charcoal, red)
    create_wall_poster("Poster_AlReves", poster_assets["Poster_AlReves"], (6.12, 0.66, 0.94), train_angle, (0.52, 0.72), charcoal)
    create_wall_poster("Poster_UniverseMap", poster_assets["Poster_UniverseMap"], (-4.72, 1.76, 1.16), math.radians(90), (0.56, 0.56), charcoal)

    create_cassette("Cassette_MssWhite", poster_assets["Poster_MssWhite"], (-3.86, -2.98, 0.0), math.radians(18), graphite, red, cream)
    create_cassette("Cassette_AlReves", poster_assets["Poster_AlReves"], (0.56, -1.6, 0.0), math.radians(-8), graphite, red, cream)
    create_cassette("Cassette_DesdeSol", poster_assets["Poster_DesdeSol"], (6.36, -0.3, 0.0), math.radians(18), graphite, red, cream)
    create_cassette("Cassette_Ambiguous", poster_assets["Poster_Ambiguous"], (2.82, -3.18, 0.0), math.radians(11), graphite, red, cream)
    create_card_stack("CardStack_Right", (6.92, -2.6, 0.0), math.radians(-12), cream, graphite, charcoal, image_path=card_assets["CardStack_Right"])
    create_card_stack("CardStack_Left", (-6.02, -1.82, 0.0), math.radians(6), red, graphite, cream, image_path=card_assets["CardStack_Left"])

    camera_data = bpy.data.cameras.new("SceneCamera")
    camera = bpy.data.objects.new("SceneCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (-11.5, -13.2, 8.7)
    camera.data.lens = 56
    camera.data.sensor_width = 36
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 18.0
    camera.data.dof.aperture_fstop = 7.1
    look_at(camera, (1.7, 0.86, 0.9))
    bpy.context.scene.camera = camera

    area_data = bpy.data.lights.new("KeyLight", type="AREA")
    area_data.energy = 5000
    area_data.shape = "RECTANGLE"
    area_data.size = 8.2
    area_data.size_y = 5.8
    key = bpy.data.objects.new("KeyLight", area_data)
    key.location = (-4.6, -3.9, 8.2)
    key.rotation_euler = (math.radians(60), 0.0, math.radians(24))
    bpy.context.collection.objects.link(key)

    rim_data = bpy.data.lights.new("RimLight", type="SUN")
    rim_data.energy = 1.75
    rim = bpy.data.objects.new("RimLight", rim_data)
    rim.rotation_euler = (math.radians(44), math.radians(-2), math.radians(132))
    bpy.context.collection.objects.link(rim)

    fill_data = bpy.data.lights.new("FillLight", type="AREA")
    fill_data.energy = 1500
    fill_data.size = 5.4
    fill = bpy.data.objects.new("FillLight", fill_data)
    fill.location = (6.7, 2.6, 5.0)
    fill.rotation_euler = (math.radians(66), 0.0, math.radians(-138))
    bpy.context.collection.objects.link(fill)

    stylize_scene_objects()

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    bpy.context.scene.render.filepath = RENDER_PATH
    bpy.ops.render.render(write_still=True)
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        use_visible=True,
        export_apply=True,
        export_yup=True,
        export_cameras=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_animations=False,
    )
    return {
        "render_path": RENDER_PATH,
        "blend_path": BLEND_PATH,
        "glb_path": GLB_PATH,
        "object_count": len(bpy.data.objects),
        "train_objects": [front_car.name, rear_car.name],
    }


if __name__ == "__main__":
    result = create_scene()
    print(result)
